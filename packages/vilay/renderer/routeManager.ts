import * as React from 'react'

export class RouteManager {
  #currentPage: React.FC<{ variables: unknown }> | null = null
  #variables: unknown | null = null
  #listeners = new Set<() => void>()

  get currentPage() {
    return this.#currentPage
  }

  get variables() {
    return this.#variables
  }

  constructor(params?: {
    initialPage: React.FC<{ variables: unknown }>
    variables: unknown
  }) {
    if (params) {
      this.#currentPage = params.initialPage
      this.#variables = params.variables
    }
  }

  // Sets a new page with variables preloaded for that page.
  setPage(
    page: React.FC<{ variables: unknown }>,
    variables: unknown
  ) {
    this.#currentPage = page
    this.#variables = variables

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
  // Store the data using React to actually make the state update to result in suspension.
  const [{ currentPage, variables }, setRouterState] = React.useState({
    currentPage: routeManager.currentPage,
    variables: routeManager.variables,
  })
  const [, startTransition] = React.useTransition()

  React.useEffect(() => {
    const listener = () => {
      setTransitioning(true)
      startTransition(() => {
        setRouterState({
          currentPage: routeManager.currentPage,
          variables: routeManager.variables,
        })
        setTransitioning(false)
      })
    }
    routeManager.addListener(listener)

    return () => routeManager.deleteListener(listener)
  }, [routeManager, setRouterState, setTransitioning, startTransition])

  return [currentPage, variables, transitioning] as const
}
