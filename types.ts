import type React from 'react'
import type { Environment, GraphQLTaggedNode, Variables } from 'relay-runtime'
import type { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes'

// The `pageContext` that are available in both on the server-side and browser-side
export type PageContext = {
  Page: () => React.ReactElement
  exports?: {
    PageLayout: React.FC<PageLayoutProps>
    initRelayEnvironment: InitRelayEnvironment
    head?: {
      title?: string
      meta?: {
        description?: string
      }
    }
    query?: GraphQLTaggedNode
    getQueryVariables: GetQueryVariables<unknown, Variables>
  }
  routeParams: Record<string, unknown>
  relayInitialData: RecordMap
}

// Type definition for `getQueryVariables` function.
export type GetQueryVariables<RouteParams, Variables> = (
  routeParams: RouteParams
) => Variables

export type PageLayoutProps = {
  children: React.ReactNode
  routeTransitioning: boolean
}

export type InitRelayEnvironment = (
  isServer: boolean,
  records?: RecordMap
) => Environment
