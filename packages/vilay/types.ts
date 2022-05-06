import type React from 'react'
import type { Environment, GraphQLTaggedNode, Variables } from 'relay-runtime'
import type { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes'

export type PageContext = {
  Page?: Page
  exports?: {
    PageLayout: React.FC<PageLayoutProps>
    initRelayEnvironment: InitRelayEnvironment
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

type FetchFn = typeof fetch

export type InitRelayEnvironment = (
  isServer: boolean,
  fetch: FetchFn,
  records?: RecordMap
) => Environment

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
