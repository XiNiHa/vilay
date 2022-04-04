import {
  dangerouslySkipEscape,
  escapeInject,
  pipeNodeStream,
  type PageContextBuiltIn,
} from 'vite-plugin-ssr'
import { renderToPipeableStream } from 'react-dom/server'
import type { PageContext } from '../types'
import { initEnvironment } from './RelayEnvironment'
import preloadQuery from './preloadQuery'
import { RouteManager } from './routeManager'
import { PageShell } from './PageShell'
import config from '../config'

// Only props listed here are passed to client's PageContext, see https://vite-plugin-ssr.com/passToClient for more info.
export const passToClient = ['routeParams', 'relayInitialData']

// This is the main render function that is called by vite-plugin-ssr.
export async function render(pageContext: PageContextBuiltIn & PageContext) {
  // Performs React Streaming SSR
  const { initialCompletion, totalCompletion, pipe, getStoreSource } =
    renderReact(pageContext)

  // Merge config's head data and page's head data
  const { exports } = pageContext
  const headTags: string[] = []
  const merged = {
    ...config.head,
    ...exports?.documentProps?.head,
    meta: {
      ...config.head.meta,
      ...exports?.documentProps?.head?.meta,
    },
  }

  // Add header tags from merged data
  for (const [tag, value] of Object.entries(merged)) {
    if (tag === 'meta') {
      for (const [name, content] of Object.entries(value)) {
        headTags.push(`<meta name="${name}" content="${content}">`)
      }
    } else {
      headTags.push(`<${tag}>${value}</${tag}>`)
    }
  }

  // This awaits for initial completion of streaming rendering.
  // Max wait time is `config.ssr.initialSendTimeout`, it will end early if there's no part suspended.
  await initialCompletion

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${dangerouslySkipEscape(headTags.join('\n'))}
      </head>
      <body>
        <div id="page-view">${pipeNodeStream(pipe)}</div>
        <script>let global = globalThis;</script>
      </body>
    </html>`

  return {
    documentHtml,
    // Sends Relay store data to client, after the streaming ends.
    // This ensures that the store data is extracted after getting filled with fetched data.
    pageContext: totalCompletion
      .then(() => ({
        relayInitialData: getStoreSource().toJSON(),
      }))
      .catch(() => ({})),
  }
}

// Performs React Streaming SSR.
const renderReact = (pageContext: PageContextBuiltIn & PageContext) => {
  const { Page } = pageContext

  // Initialize server-side Relay environment
  const relayEnvironment = initEnvironment(true)
  // Preload query for the page to render.
  const relayQueryRef = preloadQuery(pageContext, relayEnvironment)

  // Variables for storing promise resolve/reject functions and states.
  let resolveInitial: () => void
  let rejectInitial: (reason: Error) => void
  let resolveTotal: () => void
  let rejectTotal: (reason: Error) => void
  let initialResolved = false
  let totalResolved = false

  // Initial completion promise. Stream isn't passed to the client until this resolves.
  const initialCompletion = new Promise<true>((res, rej) => {
    resolveInitial = () => {
      initialResolved = true
      res(true)
    }
    rejectInitial = rej
  })

  // Total completion promise. Relay store data is passed when this promise is resolved.
  const totalCompletion = new Promise<true>((res, rej) => {
    resolveTotal = () => {
      totalResolved = true
      res(true)
    }
    rejectTotal = rej
  })

  // Render the page to a stream.
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
        // If the initial promise isn't resolved until total completion, resolve it.
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

  // Resolve initial completion promise after initial send timeout.
  setTimeout(
    () => initialResolved || resolveInitial(),
    config.ssr.initialSendTimeout
  )
  // Abort rendering after about timeout.
  setTimeout(() => totalResolved || abortRender(), config.ssr.abortTimeout)

  // Expose store source.
  const getStoreSource = () => relayEnvironment.getStore().getSource()

  return { initialCompletion, totalCompletion, pipe, getStoreSource }
}
