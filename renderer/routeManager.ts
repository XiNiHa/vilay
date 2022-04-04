import * as React from 'react'
import type { PreloadedQuery } from 'react-relay'
import type { OperationType } from 'relay-runtime'

// Route manager dedicated from React and vite-plugin-ssr.
// Used for connecting between those.
export class RouteManager {
  #currentPage: React.FC<{ queryRef: unknown }> | null = null
  #queryRef: PreloadedQuery<OperationType> | undefined | null = null
  #listeners = new Set<() => void>()

  get currentPage() {
    return this.#currentPage
  }

  get queryRef() {
    return this.#queryRef
  }

  constructor(params?: {
    initialPage: React.FC<{ queryRef: unknown }>
    queryRef: PreloadedQuery<OperationType> | undefined
  }) {
    if (params) {
      this.#currentPage = params.initialPage
      this.#queryRef = params.queryRef
    }
  }

  // Sets a new page with queryRef preloaded for that page.
  setPage(
    page: React.FC<{ queryRef: unknown }>,
    queryRef: PreloadedQuery<OperationType> | undefined
  ) {
    this.#currentPage = page
    this.#queryRef = queryRef

    // Notify all listeners.
    for (const listener of this.#listeners) {
      listener()
    }
  }

  addListener(listener: () => void) {
    this.#listeners.add(listener)
  }

  deleteListener(listener: () => void) {
    this.#listeners.delete(listener)
  }
}

// Wrapper hook for the RouteManager.
// Utilizes `useTransition()` for smooth routing experience.
export const useRouteManager = (routeManager: RouteManager) => {
  // Used for tracking the whole route transition.
  const [transitioning, setTransitioning] = React.useState(false)
  // Store the data using React to actually make the state update to result in suspension.
  const [{ currentPage, queryRef }, setRouterState] = React.useState({
    currentPage: routeManager.currentPage,
    queryRef: routeManager.queryRef,
  })
  const [, startTransition] = React.useTransition()

  React.useEffect(() => {
    const listener = () => {
      // First, update the state to notify that the transition is in progress.
      setTransitioning(true)
      // And then actually start the transition, deferred using `startTransition()`.
      startTransition(() => {
        // Since this will result in suspension, it'll take some time for render to finish.
        setRouterState({
          currentPage: routeManager.currentPage,
          queryRef: routeManager.queryRef,
        })
        // And then this will be applied together, finishes the transition.
        setTransitioning(false)
      })
    }
    routeManager.addListener(listener)

    return () => routeManager.deleteListener(listener)
  }, [routeManager, setRouterState, setTransitioning, startTransition])

  return [currentPage, queryRef, transitioning] as const
}
