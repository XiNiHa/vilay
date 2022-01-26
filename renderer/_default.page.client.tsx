import ReactDOM from 'react-dom'
import type { Environment } from 'react-relay'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import { useClientRouter } from 'vite-plugin-ssr/client/router'
import type { PageContext } from './types'
import { initEnvironment } from './RelayEnvironment'
import preloadQuery from './preloadQuery'
import { PageShell } from './PageShell'
import '@unocss/reset/tailwind.css'
import 'uno.css'

let containerRoot: ReactDOM.Root | null = null
let relayEnvironment: Environment | null = null

// Use vite-plugin-ssr's client router.
useClientRouter({
  // `render()` is called on every navigation.
  render(pageContext: PageContextBuiltInClient & PageContext) {
    const { Page, relayInitialData } = pageContext

    if (!relayEnvironment)
      relayEnvironment = initEnvironment(false, relayInitialData)
    
    // Load the query needed for the page.
    // Preloading through links is not supported yet, see https://github.com/brillout/vite-plugin-ssr/issues/246 for details.
    const relayQueryRef = preloadQuery(pageContext, relayEnvironment)

    const page = (
      <PageShell
        pageContext={pageContext}
        childComponent={Page}
        relayEnvironment={relayEnvironment}
        relayQueryRef={relayQueryRef}
      />
    )

    // Hydrate/render the page.
    const container = document.getElementById('page-view')
    if (!container) throw new Error('Element with id "page-view" not found, which was expected to be a container root.')
    if (pageContext.isHydration) {
      containerRoot = ReactDOM.hydrateRoot(container, page)
    } else {
      if (!containerRoot) {
        containerRoot = ReactDOM.createRoot(container)
      }
      containerRoot.render(page)
    }
  },
})
