import React from 'react'
import { RelayEnvironmentProvider, type Environment } from 'react-relay'
import { ErrorBoundary } from 'react-error-boundary'
import type { PageContext } from './types'
import { RouteManager, useRouteManager } from './routeManager'
import { PageContextProvider } from './usePageContext'
import ErrorFallback from './ErrorFallback'
import { Suspense } from './relayWrapper'

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
  const [CurrentPage, variables, routeTransitioning] =
    useRouteManager(routeManager)

  const links = {
    '/': 'Home',
    '/repo/xiniha/vite-ssr-relay-template/issues': 'Issues',
    '/repo/xiniha/vite-ssr-relay-template/issues/create': 'Create Issue',
  }

  return (
    <React.StrictMode>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <PageContextProvider pageContext={pageContext}>
          <LoadingIndicator transitioning={routeTransitioning} />
          <Layout>
            <Sidebar>
              <h1 className="my-4 text-2xl">
                Vite Plugin SSR + React 18 + Relay
              </h1>
              <ShellCounter />
              {Object.entries(links).map(([href, text]) => (
                <a
                  href={href}
                  key={href}
                  className="text-base hover:text-1.05rem transition-all duration-300"
                >
                  {text}
                </a>
              ))}
            </Sidebar>
            <Content>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={'Loading...'}>
                  {CurrentPage && <CurrentPage variables={variables} />}
                </Suspense>
              </ErrorBoundary>
            </Content>
          </Layout>
        </PageContextProvider>
      </RelayEnvironmentProvider>
    </React.StrictMode>
  )
}

const LoadingIndicator: React.FC<{ transitioning: boolean }> = ({
  transitioning,
}) => {
  return (
    <div
      className="absolute left-0 right-0 top-0 h-2 bg-green-200 transition-opacity duration-300"
      style={{ opacity: transitioning ? 100 : 0 }}
    />
  )
}

const Layout: React.FC = ({ children }) => (
  <div className="flex max-w-900px m-auto">{children}</div>
)

const Sidebar: React.FC = ({ children }) => (
  <div className="p-5 flex-shrink-0 flex flex-col items-end leading-7">
    {children}
  </div>
)

const Content: React.FC = ({ children }) => (
  <div className="p-5 pb-12 border-l-2 border-#eee min-h-screen">
    {children}
  </div>
)

const ShellCounter: React.FC = () => {
  const [count, setCount] = React.useState(0)

  return <button className="bg-gray-400 px-4" onClick={() => setCount(count + 1)}>{count}</button>
}
