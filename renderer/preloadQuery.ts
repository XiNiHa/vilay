import { loadQuery, type Environment } from 'react-relay'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import type { PageContext } from '../types'

// Utility function for preloading page queries.
export default (
  pageContext: (PageContextBuiltIn | PageContextBuiltInClient) & PageContext,
  relayEnvironment: Environment
) => {
  // Look for page query from page exports.
  const query = pageContext.exports?.query
  // Look for function for getting query variables.
  const getQueryVariables = pageContext.exports?.getQueryVariables
  const routeParams = pageContext.routeParams ?? {}

  // Load query if query export exists
  // If the function exists, use it for getting query variables.
  // Otherwise use route params as query variables.
  return (
    query &&
    loadQuery(
      relayEnvironment,
      query,
      getQueryVariables?.(routeParams) ?? routeParams
    )
  )
}
