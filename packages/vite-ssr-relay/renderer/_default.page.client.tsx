import ReactDOMClient from 'react-dom/client'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import type { PageContext } from '../types'
import { getQueryVariables } from './preloadQuery'
import { PageShell } from './PageShell'
import { RouteManager } from './routeManager'
import './bootstrap'

let containerRoot: ReactDOMClient.Root | null = null
let routeManager: RouteManager | null = null

export const clientRouting = true

export async function render(
  pageContext: PageContextBuiltInClient & PageContext
) {
  const {
    Page,
    isHydration,
    exports: { initRelayEnvironment, head },
  } = pageContext

  window.relayEnv ??= initRelayEnvironment(false)

  if (window.$caches?.length && window.$updateRelay) {
    window.$caches?.forEach(window.$updateRelay)
    delete window.$caches
  }

  const variables = getQueryVariables(pageContext)

  routeManager ??= new RouteManager()
  routeManager.setPage(Page, variables)

  if (head && !isHydration) {
    const headTags: HTMLElement[] = []
    for (const [tag, value] of Object.entries(head)) {
      if (tag === 'meta') {
        for (const [name, content] of Object.entries(value)) {
          const node = document.createElement('meta')
          node.setAttribute('name', name)
          node.setAttribute('content', content)
          headTags.push(node)
        }
      } else {
        const node = document.createElement(tag)
        node.innerHTML = value.toString()
        headTags.push(node)
      }
    }

    let inCommentArea = false
    for (let i = 0; i < document.head.childNodes.length; i++) {
      const node = document.head.childNodes[i]
      if (node.nodeType === document.COMMENT_NODE) {
        const trimmed = node.textContent?.trim()
        if (trimmed === 'vite-ssr-relay-head-start') {
          inCommentArea = true
          continue
        } else if (trimmed === 'vite-ssr-relay-head-end') {
          node.before(...headTags)
          inCommentArea = false
          break
        }
      }
      if (inCommentArea) {
        node.remove()
        --i
      }
    }
  }

  if (!containerRoot) {
    const page = (
      <PageShell
        pageContext={pageContext}
        relayEnvironment={window.relayEnv}
        routeManager={routeManager}
      />
    )

    const container = document.getElementById('page-view')
    if (!container)
      throw new Error(
        'Element with id "page-view" not found, which was expected to be a container root.'
      )

    if (pageContext.isHydration) {
      containerRoot = ReactDOMClient.hydrateRoot(container, page)
    } else {
      containerRoot = ReactDOMClient.createRoot(container)
      containerRoot.render(page)
    }
  }
}
