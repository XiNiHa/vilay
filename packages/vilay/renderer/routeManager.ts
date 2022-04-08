import * as React from 'react'
import type { PreloadedQuery } from 'react-relay'
import type { OperationType } from 'relay-runtime'

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

  setPage(
    page: React.FC<{ queryRef: unknown }>,
    queryRef: PreloadedQuery<OperationType> | undefined
  ) {
    this.#currentPage = page
    this.#queryRef = queryRef

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

export const useRouteManager = (routeManager: RouteManager) => {
  const [transitioning, setTransitioning] = React.useState(false)
  const [{ currentPage, queryRef }, setRouterState] = React.useState({
    currentPage: routeManager.currentPage,
    queryRef: routeManager.queryRef,
  })
  const [, startTransition] = React.useTransition()

  React.useEffect(() => {
    const listener = () => {
      setTransitioning(true)
      startTransition(() => {
        setRouterState({
          currentPage: routeManager.currentPage,
          queryRef: routeManager.queryRef,
        })
        setTransitioning(false)
      })
    }
    routeManager.addListener(listener)

    return () => routeManager.deleteListener(listener)
  }, [routeManager, setRouterState, setTransitioning, startTransition])

  return [currentPage, queryRef, transitioning] as const
}
