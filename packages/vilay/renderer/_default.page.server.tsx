import {
  dangerouslySkipEscape,
  escapeInject,
  type PageContextBuiltIn,
} from 'vite-plugin-ssr'
import { renderToStream } from 'react-streaming/server'
import preloadQuery from './preloadQuery'
import { PageShell } from './PageShell'
import { RouteManager } from './routeManager'
import type { PageContext } from '../types'

export const passToClient = ['routeParams', 'relayInitialData']

export async function render(pageContext: PageContextBuiltIn & PageContext) {
  const { initialCompletion, getStoreSource } = renderReact(pageContext)

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
    exports: { make, initRelayEnvironment },
  } = pageContext

  const relayEnvironment = initRelayEnvironment(true, pageContext.fetch)
  const relayQueryRef = preloadQuery(pageContext, relayEnvironment)

  const children = (
    <PageShell
      pageContext={pageContext}
      relayEnvironment={relayEnvironment}
      routeManager={
        new RouteManager({
          initialPage: Page ?? make,
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
