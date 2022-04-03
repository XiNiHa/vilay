import ReactDOMClient from 'react-dom/client'
import type { Environment } from 'react-relay'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import type { PageContext } from './types'
import { initEnvironment } from './RelayEnvironment'
import preloadQuery from './preloadQuery'
import { PageShell } from './PageShell'
import { RouteManager } from './routeManager'
import '@unocss/reset/tailwind.css'
import 'uno.css'

let relayEnvironment: Environment | null = null
let routeManager: RouteManager | null = null

// `render()` is called on every navigation.
export async function render(
  pageContext: PageContextBuiltInClient & PageContext
) {
  const { Page, relayInitialData } = pageContext

  if (!relayEnvironment)
    relayEnvironment = initEnvironment(false, relayInitialData)

  // Load the query needed for the page.
  // Preloading through links is not supported yet, see https://github.com/brillout/vite-plugin-ssr/issues/246 for details.
  const relayQueryRef = preloadQuery(pageContext, relayEnvironment)

  // Create a new route manager if haven't.
  routeManager ??= new RouteManager()
  // Update the route manager with the new route.
  routeManager.setPage(Page, relayQueryRef)

  const page = (
    <PageShell
      pageContext={pageContext}
      relayEnvironment={relayEnvironment}
      routeManager={routeManager}
    />
  )

  // Hydrate the page.
  const container = document.getElementById('page-view')
  if (!container)
    throw new Error(
      'Element with id "page-view" not found, which was expected to be a container root.'
    )
  ReactDOMClient.hydrateRoot(container, page)
}
