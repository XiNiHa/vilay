import { loadQuery, type Environment } from 'react-relay'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'
import type { PageContext } from '../types'

export default (
  pageContext: (PageContextBuiltIn | PageContextBuiltInClient) & PageContext,
  relayEnvironment: Environment
) => {
  const query = pageContext.exports?.query
  const getQueryVariables = pageContext.exports?.getQueryVariables
  const routeParams = pageContext.routeParams ?? {}

  return (
    query &&
    loadQuery(
      relayEnvironment,
      query,
      getQueryVariables?.(routeParams) ?? routeParams
    )
  )
}
