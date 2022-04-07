import React from 'react'
import { RelayEnvironmentProvider, type Environment } from 'react-relay'
import type { PageContext } from '../types'
import { RouteManager, useRouteManager } from './routeManager'
import { PageContextProvider } from './usePageContext'

interface Props {
  pageContext: PageContext
  relayEnvironment: Environment
  routeManager: RouteManager
}

// Page root component
export const PageShell: React.FC<Props> = ({
  pageContext,
  relayEnvironment,
  routeManager,
}) => {
  const PageLayout = pageContext.exports?.PageLayout ?? Passthrough
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

const Passthrough: React.FC = ({ children }) => <>{children}</>
