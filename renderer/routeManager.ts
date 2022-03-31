import * as React from 'react'

// Route manager dedicated from React and vite-plugin-ssr.
// Used for connecting between those.
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
  const [{ currentPage, variables }, setRouterState] = React.useState({
    currentPage: routeManager.currentPage,
    variables: routeManager.variables,
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
          variables: routeManager.variables,
        })
        // And then this will be applied together, finishes the transition.
        setTransitioning(false)
      })
    }
    routeManager.addListener(listener)

    return () => routeManager.deleteListener(listener)
  }, [routeManager, setRouterState, setTransitioning, startTransition])

  return [currentPage, variables, transitioning] as const
}
