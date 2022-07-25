import React from 'react'
import { useRouteManager, VilayApp, type PageShellProps } from 'vilay'

// a do-nothing example
const ExampleContext = React.createContext(null)

// Custom PageShell component - add your contexts here!
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
      {/* Place a provider above the relay provider so 
          you can pass auth credentials to pageContext for requests */}
      <ExampleContext.Provider value={null}>
        <VilayApp relayEnvironment={relayEnvironment} pageContext={pageContext}>
          <PageLayout routeTransitioning={routeTransitioning}>
            {CurrentPage && <CurrentPage queryRef={queryRef} />}
          </PageLayout>
        </VilayApp>
      </ExampleContext.Provider>
    </React.StrictMode>
  )
}

const Passthrough: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>
