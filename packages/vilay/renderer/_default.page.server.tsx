import {
  dangerouslySkipEscape,
  escapeInject,
  pipeNodeStream,
  type PageContextBuiltIn,
} from 'vite-plugin-ssr'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
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
  const { initialCompletion, totalCompletion, pipe, getStoreSource } =
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

  await initialCompletion

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
        <div id="page-view">${pipeNodeStream(pipe)}</div>
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

  const relayEnvironment = initRelayEnvironment(true)
  const relayQueryRef = preloadQuery(pageContext, relayEnvironment)

  let resolveInitial: () => void
  let rejectInitial: (reason: Error) => void
  let resolveTotal: () => void
  let rejectTotal: (reason: Error) => void
  let initialResolved = false
  let totalResolved = false

  const initialCompletion = new Promise<true>((res, rej) => {
    resolveInitial = () => {
      initialResolved = true
      res(true)
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

  const { pipe, abort: _abort } = renderToPipeableStream(
    <PageShell
      pageContext={pageContext}
      relayEnvironment={relayEnvironment}
      routeManager={
        new RouteManager({
          initialPage: Page,
          queryRef: relayQueryRef,
        })
      }
    />,
    {
      onAllReady: () => {
        if (!initialResolved) resolveInitial()
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
    () => initialResolved || resolveInitial(),
    config.ssr.initialSendTimeout
  )
  setTimeout(() => totalResolved || abortRender(), config.ssr.abortTimeout)

  const getStoreSource = () => relayEnvironment.getStore().getSource()

  return { initialCompletion, totalCompletion, pipe, getStoreSource }
}
