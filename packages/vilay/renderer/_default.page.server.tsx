import {
  dangerouslySkipEscape,
  escapeInject,
  pipeNodeStream,
  type PageContextBuiltIn,
} from 'vite-plugin-ssr'
import React, { ReactNode } from 'react'
import * as ReactDOMServer from 'react-dom/server'
import type { Writable } from 'node:stream'
import type { Store } from 'relay-runtime'
import config from 'virtual:vilay:config'
import preloadQuery from './preloadQuery'
import { PageShell } from './PageShell'
import { RouteManager } from './routeManager'
import type { PageContext } from '../types'

export const passToClient = ['routeParams', 'relayInitialData']

export async function render(
  pageContext: PageContextBuiltIn & PageContext
): Promise<{
  documentHtml: ReturnType<typeof escapeInject>
  pageContext: Promise<unknown>
}> {
  const { initialCompletion, totalCompletion, getStoreSource } =
    renderReact(pageContext)

  const { exports } = pageContext
  const headTags: string[] = []

  if (exports.head) {
    for (const [tag, value] of Object.entries(exports.head)) {
      if (tag === 'meta') {
        for (const [name, content] of Object.entries(value)) {
          headTags.push(`<meta name="${name}" content="${content}">`)
        }
      } else {
        headTags.push(`<${tag}>${value}</${tag}>`)
      }
    }
  }

  const { pipe, stream } = await initialCompletion

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <!-- vilay-head-start -->
        ${dangerouslySkipEscape(headTags.join('\n'))}
        <!-- vilay-head-end -->
      </head>
      <body>
        <div id="page-view">${pipe ? pipeNodeStream(pipe) : stream ?? ''}</div>
        <script>let global = globalThis;</script>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: totalCompletion
      .then(() => ({
        relayInitialData: getStoreSource().toJSON(),
      }))
      .catch(() => ({})),
  }
}

// Performs React Streaming SSR.
const renderReact = (pageContext: PageContextBuiltIn & PageContext) => {
  const {
    Page,
    exports: { initRelayEnvironment },
  } = pageContext

  const relayEnvironment = initRelayEnvironment(true, pageContext.fetch)
  const relayQueryRef = preloadQuery(pageContext, relayEnvironment)

  const children = (
    <PageShell
      pageContext={pageContext}
      relayEnvironment={relayEnvironment}
      routeManager={
        new RouteManager({
          initialPage: Page,
          queryRef: relayQueryRef,
        })
      }
    />
  )

  if ('renderToPipeableStream' in ReactDOMServer) {
    return renderReactToPipeableStream(children, () =>
      relayEnvironment.getStore().getSource()
    )
  } else if ('renderToReadableStream' in ReactDOMServer) {
    return renderReactToReadableStream(children, () =>
      relayEnvironment.getStore().getSource()
    )
  } else {
    throw new Error(
      `Both 'renderToPipeableStream' and 'rendertoReadableStream' are unavailable in ReactDOMServer! Looks like the bundle is broken...`
    )
  }
}

type RenderSource = {
  pipe?: (dest: Writable) => Writable
  stream?: ReactDOMServer.ReactDOMServerReadableStream
}

const renderReactToPipeableStream = (
  children: ReactNode,
  getStoreSource: () => ReturnType<Store['getSource']>
) => {
  let resolveInitial: (source: RenderSource) => void
  let rejectInitial: (reason: unknown) => void
  let resolveTotal: () => void
  let rejectTotal: (reason: unknown) => void
  let initialResolved = false
  let totalResolved = false

  const initialCompletion = new Promise<RenderSource>((res, rej) => {
    resolveInitial = (source: RenderSource) => {
      initialResolved = true
      res(source)
    }
    rejectInitial = rej
  })

  const totalCompletion = new Promise<true>((res, rej) => {
    resolveTotal = () => {
      totalResolved = true
      res(true)
    }
    rejectTotal = rej
  })

  const { pipe, abort: _abort } = ReactDOMServer.renderToPipeableStream(
    children,
    {
      onAllReady: () => {
        if (!initialResolved) resolveInitial({ pipe })
        if (!totalResolved) resolveTotal()
      },
      onError: (err) => {
        console.error('React SSR Error', err)
        if (!initialResolved) rejectInitial(err)
        if (!totalResolved) rejectTotal(err)
      },
    }
  )

  const abortRender = () => {
    _abort()
    if (!initialResolved) rejectInitial(new Error('React SSR Error: Aborted'))
    if (!totalResolved) rejectTotal(new Error('React SSR Error: Aborted'))
  }

  setTimeout(
    () => initialResolved || resolveInitial({ pipe }),
    config.ssr.initialSendTimeout
  )
  setTimeout(() => totalResolved || abortRender(), config.ssr.abortTimeout)

  return { initialCompletion, totalCompletion, pipe, getStoreSource }
}

const renderReactToReadableStream = (
  children: ReactNode,
  getStoreSource: () => ReturnType<Store['getSource']>
) => {
  let resolveTotal: () => void
  let rejectTotal: (reason: unknown) => void
  let abort: (() => void) | undefined = undefined
  let totalResolved = false

  const totalCompletion = new Promise<true>((res, rej) => {
    resolveTotal = () => {
      totalResolved = true
      res(true)
    }
    rejectTotal = rej
  })

  const streamPromise = ReactDOMServer.renderToReadableStream(children, {
    onError: (err) => {
      console.error('React SSR Error', err)
      rejectTotal(err)
    },
  })

  const initialCompletion: Promise<RenderSource> = Promise.all([
    streamPromise,
    new Promise((res) => setTimeout(res, config.ssr.initialSendTimeout)),
  ]).then(([stream]) => ({ stream }))

  streamPromise.then((stream) => {
    stream.allReady.then(() => resolveTotal())
    abort = () => stream.cancel()
  })

  const abortRender = () => {
    if (abort) abort()
    if (!totalResolved) rejectTotal(new Error('React SSR Error: Aborted'))
  }

  setTimeout(() => totalResolved || abortRender(), config.ssr.abortTimeout)

  return { initialCompletion, totalCompletion, getStoreSource }
}
