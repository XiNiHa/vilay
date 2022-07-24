import React from 'react'
import {
  dangerouslySkipEscape,
  escapeInject,
  type PageContextBuiltIn,
} from 'vite-plugin-ssr'
import { renderToStream } from '@vilay/render'
import preloadQuery from './preloadQuery'
import { PageShell as DefaultPageShell } from './PageShell'
import { RouteManager } from './routeManager'
import type { PageContext } from '../types'

export const passToClient = ['routeParams', 'relayInitialData', 'redirectTo']

export async function render(pageContext: PageContextBuiltIn & PageContext) {
  const { initialCompletion, getStoreSource } = renderReact(pageContext)

  const { exports, redirectTo } = pageContext

  if (redirectTo) {
    return {
      documentHtml: null,
      pageContext: { redirectTo },
    }
  }

  const headTags: string[] = []

  if (exports.getPageHead) {
    for (const [tag, value] of Object.entries(
      exports.getPageHead(pageContext)
    )) {
      if (tag === 'meta') {
        for (const [name, content] of Object.entries(value)) {
          headTags.push(`<meta name="${name}" content="${content}">`)
        }
      } else {
        headTags.push(`<${tag}>${value}</${tag}>`)
      }
    }
  }

  const stream = await initialCompletion
  const { streamEnd } = stream

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
        <div id="page-view">${stream}</div>
        <script>let global = globalThis;</script>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: streamEnd
      .then(() => ({ relayInitialData: getStoreSource().toJSON() }))
      .catch(() => ({})),
  }
}

// Performs React Streaming SSR.
const renderReact = (pageContext: PageContextBuiltIn & PageContext) => {
  const {
    Page,
    userAgent,
    exports: { initRelayEnvironment, PageShell: ProvidedPageShell },
  } = pageContext

  const PageShell = ProvidedPageShell ?? DefaultPageShell
  const relayEnvironment = initRelayEnvironment({
    isServer: true,
    pageContext,
  })
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

  return {
    initialCompletion: renderToStream(children, { userAgent }),
    getStoreSource: () => relayEnvironment.getStore().getSource(),
  }
}
