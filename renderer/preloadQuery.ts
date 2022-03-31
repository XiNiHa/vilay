import {
  loadQuery,
  type Environment,
  type GraphQLTaggedNode,
  type Variables,
} from 'react-relay'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import type { PageContext } from './types'

type GetQueryVariables = (routeParams: unknown) => Variables

export const getQueryVariables = (
  pageContext: (PageContextBuiltIn | PageContextBuiltInClient) & PageContext
) => {
  // Look for function for getting query variables.
  const getQueryVariables =
    (pageContext.pageExports?.getQueryVariables as GetQueryVariables) ??
    undefined
  const routeParams = pageContext.routeParams ?? {}
  return getQueryVariables?.(routeParams) ?? routeParams
}

// Utility function for preloading page queries.
export default (
  pageContext: (PageContextBuiltIn | PageContextBuiltInClient) & PageContext,
  relayEnvironment: Environment
) => {
  // Look for page query from page exports.
  const query =
    (pageContext.pageExports?.query as GraphQLTaggedNode) ?? undefined
  if (!query) return undefined
  const variables = getQueryVariables(pageContext)

  // Load query if query export exists
  // If the function exists, use it for getting query variables.
  // Otherwise use route params as query variables.
  return { queryRef: loadQuery(relayEnvironment, query, variables), variables }
}
