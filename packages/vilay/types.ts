import type React from 'react'
import type { Environment, GraphQLTaggedNode, Variables } from 'relay-runtime'
import type { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes'

export type PageContext = {
  Page?: Page
  userAgent?: string
  cookies?: Record<string, string>
  redirectTo?: string
  exports?: {
    initRelayEnvironment: InitRelayEnvironment
    PageLayout?: React.FC<PageLayoutProps>
    pageLayout?: React.FC<PageLayoutProps>
    head?: HeadExports
    query?: GraphQLTaggedNode
    getQueryVariables: GetQueryVariables<unknown, Variables>
  }
  routeParams: Record<string, unknown>
  fetch: typeof fetch
  relayInitialData: RecordMap
}

export type Page<Props = Record<string, unknown>> = React.FC<Props>

export type HeadExports = {
  title?: string
  meta?: {
    description?: string
  } & Record<string, unknown>
} & Record<string, unknown>

export type GetQueryVariables<RouteParams, Variables> = (
  routeParams: RouteParams
) => Variables

export type PageLayoutProps = {
  children: React.ReactNode
  routeTransitioning: boolean
}

export type InitRelayEnvironment = (opts: {
  pageContext: PageContext
  isServer: boolean
}) => Environment

export const defineVilay = <
  T extends {
    PageProps?: unknown
    RouteParams?: unknown
    QueryVariables?: Variables
  } = {
    PageProps: Record<string, never>,
    RouteParams: Record<string, never>,
    QueryVariables: Variables
  }
>(pageExports: {
  PageLayout?: React.FC<PageLayoutProps>
  initRelayEnvironment?: InitRelayEnvironment
  Page?: Page<T['PageProps']>
  head?: HeadExports
  query?: GraphQLTaggedNode
  getQueryVariables?: GetQueryVariables<T['RouteParams'], T['QueryVariables']>
}) => pageExports
