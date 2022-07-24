import React from 'react'
import { RelayEnvironmentProvider, type Environment } from 'react-relay'
import { useRouteManager } from 'vilay'

import type { PageContext, RouteManager } from 'vilay'

import { PageContextProvider } from './usePageContext'

export interface PageShellProps {
  pageContext: PageContext
  relayEnvironment: Environment
  routeManager: RouteManager
}

// Custom Page root component
export const PageShell: React.FC<PageShellProps> = ({
  pageContext,
  relayEnvironment,
  routeManager,
}) => {
  const PageLayout =
    pageContext.exports?.PageLayout ??
    pageContext.exports?.pageLayout ??
    Passthrough
  const [CurrentPage, queryRef, routeTransitioning] =
    useRouteManager(routeManager)
  return (
    <React.StrictMode>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <PageContextProvider pageContext={pageContext}>
          <PageLayout routeTransitioning={routeTransitioning}>
            {CurrentPage && <CurrentPage queryRef={queryRef} />}
          </PageLayout>
        </PageContextProvider>
      </RelayEnvironmentProvider>
    </React.StrictMode>
  )
}

const Passthrough: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>
