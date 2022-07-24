import React from 'react'
import { RelayEnvironmentProvider, type Environment } from 'react-relay'
import type { PageContext } from '../types'
import { RouteManager, useRouteManager } from './routeManager'

import { PageContextProvider } from './usePageContext'

export interface PageShellProps {
  relayEnvironment: Environment
  routeManager: RouteManager
}

export interface VilayAppProps {
  pageContext: PageContext | null
  relayEnvironment: Environment
  children: React.ReactNode
}

// Page root component
export const PageShell: React.FC<PageShellProps> = ({
  relayEnvironment,
  routeManager,
}) => {
  const [CurrentPage, pageContext, queryRef, routeTransitioning] =
    useRouteManager(routeManager)
  const PageLayout =
    pageContext?.exports?.PageLayout ??
    pageContext?.exports?.pageLayout ??
    Passthrough

  return (
    <React.StrictMode>
      <VilayApp relayEnvironment={relayEnvironment} pageContext={pageContext}>
        <PageLayout routeTransitioning={routeTransitioning}>
          {CurrentPage && <CurrentPage queryRef={queryRef} />}
        </PageLayout>
      </VilayApp>
    </React.StrictMode>
  )
}

export const VilayApp: React.FC<VilayAppProps> = ({
  relayEnvironment,
  pageContext,
  children,
}) => (
  <RelayEnvironmentProvider environment={relayEnvironment}>
    <PageContextProvider pageContext={pageContext}>
      {children}
    </PageContextProvider>
  </RelayEnvironmentProvider>
)

const Passthrough: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>
