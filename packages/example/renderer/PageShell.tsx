import React from 'react'
import { useRouteManager, VilayApp, type PageShellProps } from 'vilay'

// Custom Page root component
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

const Passthrough: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>
