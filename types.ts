import type { GraphQLTaggedNode, Variables } from 'relay-runtime'

// The `pageContext` that are available in both on the server-side and browser-side
export type PageContext = {
  Page: () => React.ReactElement
  exports?: {
    documentProps?: {
      head?: {
        title?: string
        meta?: {
          description?: string
        }
      }
    }
    query?: GraphQLTaggedNode
    getQueryVariables: GetQueryVariables<unknown, Variables>
  }
  routeParams: Record<string, unknown>
  relayInitialData: Record<string, unknown>
}

// Type definition for `getQueryVariables` function.
export type GetQueryVariables<RouteParams, Variables> = (
  routeParams: RouteParams
) => Variables
