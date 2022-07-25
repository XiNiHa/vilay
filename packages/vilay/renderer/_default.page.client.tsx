import React from 'react'
import ReactDOMClient from 'react-dom/client'
import { navigate } from 'vite-plugin-ssr/client/router'
import type { Environment } from 'react-relay'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import preloadQuery from './preloadQuery'
import { PageShell as DefaultPageShell } from './PageShell'
import { RouteManager } from './routeManager'
import type { PageContext } from '../types'

let containerRoot: ReactDOMClient.Root | null = null
let relayEnvironment: Environment | null = null
let routeManager: RouteManager | null = null

export const clientRouting = true

export async function render(
  pageContext: PageContextBuiltInClient & PageContext
) {
  const {
    Page,
    redirectTo,
    isHydration,
    exports: {
      initRelayEnvironment,
      getPageHead,
      PageShell: ProvidedPageShell,
    },
  } = pageContext

  if (redirectTo) return navigate(redirectTo)

  pageContext.fetch = fetch

  if (!relayEnvironment)
    relayEnvironment = initRelayEnvironment({
      isServer: false,
      pageContext,
    })

  const relayQueryRef = preloadQuery(pageContext, relayEnvironment)

  routeManager ??= new RouteManager()
  routeManager.setPage(Page, pageContext, relayQueryRef)

  if (getPageHead && !isHydration) {
    const headTags: HTMLElement[] = []
    for (const [tag, value] of Object.entries(getPageHead(pageContext))) {
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
        if (trimmed === 'vilay-head-start') {
          inCommentArea = true
          continue
        } else if (trimmed === 'vilay-head-end') {
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

  const PageShell = ProvidedPageShell ?? DefaultPageShell

  if (!containerRoot) {
    const page = (
      <PageShell
        relayEnvironment={relayEnvironment}
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
