import type React from 'react'
import type { Environment, GraphQLTaggedNode, Variables } from 'relay-runtime'
import type { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes'
import type { PageContextUrls } from 'vite-plugin-ssr/dist/cjs/shared/addComputedUrlProps'
import type { PageShellProps } from './renderer/PageShell'

export type PageContext<T = Record<string, unknown>, V = Variables> = {
  Page?: Page
  userAgent?: string
  cookies?: Record<string, string>
  redirectTo?: string
  exports?: {
    initRelayEnvironment: InitRelayEnvironment
    PageShell?: React.FC<PageShellProps>
    PageLayout?: React.FC<PageLayoutProps>
    pageLayout?: React.FC<PageLayoutProps>
    query?: GraphQLTaggedNode
    getQueryVariables: GetQueryVariables<T, V>
    getPageHead?: GetPageHead<T>
  }
  routeParams: T
  fetch: typeof fetch
  relayInitialData: RecordMap
} & PageContextUrls

export type Page<Props = Record<string, unknown>> = React.FC<Props>

export type HeadExports = {
  title?: string
  meta?: {
    description?: string
  } & Record<string, unknown>
} & Record<string, unknown>

export type GetQueryVariables<T, V> = (
  pageContext: PageContext<T, V>
) => Variables

export type GetPageHead<T> = (pageContext: PageContext<T>) => HeadExports


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
    PageProps: Record<string, never>
    RouteParams: Record<string, never>
    QueryVariables: Variables
  }
>(pageExports: {
  /**
   * Override to provide custom providers for the react render
   */
  PageShell?: React.FC<PageShellProps>
  PageLayout?: React.FC<PageLayoutProps>
  initRelayEnvironment?: InitRelayEnvironment
  Page?: Page<T['PageProps']>
  query?: GraphQLTaggedNode
  /**
   * Build the variables for the preloaded relay query from `pageContext`.
   * 
   * @example
   * ```ts
   * getQueryVariables: ({ routeParams, urlParsed }) => {
   *  return {
   *    ...routeParams,
   *    first: urlParsed?.search?.first ? parseInt(urlParsed?.search?.first) : 10,
   *    filter: {},
   *  }
   *},
   *```
   */
  getQueryVariables?: GetQueryVariables<T['RouteParams'], T['QueryVariables']>
  // TODO: optional typed params for search params would be cool here as well
  // for anyone who has to implement a faceted search it would be everything!
  /**
   * Build the page head tags from page context for the preloaded relay query.
   * Overrides `head` if defined.
   */
  getPageHead?: GetPageHead<T['RouteParams']>
}) => pageExports
