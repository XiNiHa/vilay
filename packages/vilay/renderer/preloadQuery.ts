import { loadQuery, type Environment } from 'react-relay'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import type { PageContext } from '../types'

export const getQueryVariables = (
  pageContext: (PageContextBuiltIn | PageContextBuiltInClient) & PageContext
) => {
  const getQueryVariables = pageContext.exports?.getQueryVariables
  const routeParams = pageContext.routeParams ?? {}
  return getQueryVariables?.(routeParams) ?? routeParams
}

export default (
  pageContext: (PageContextBuiltIn | PageContextBuiltInClient) & PageContext,
  relayEnvironment: Environment
) => {
  const query = pageContext.exports?.query
  if (!query) return undefined
  const variables = getQueryVariables(pageContext)

  return { queryRef: loadQuery(relayEnvironment, query, variables), variables }
}
