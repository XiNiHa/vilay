import React from 'react'
import {
  RelayEnvironmentProvider,
  type Environment,
  type PreloadedQuery,
} from 'react-relay'
import type { OperationType } from 'relay-runtime'
import { ErrorBoundary } from 'react-error-boundary'
import type { PageContext } from './types'
import { PageContextProvider } from './usePageContext'
import ErrorFallback from './ErrorFallback'

interface Props {
  pageContext: PageContext
  relayEnvironment: Environment
  relayQueryRef: PreloadedQuery<OperationType> | undefined
  childComponent: React.FC<{ queryRef?: PreloadedQuery<OperationType> }>
}

// Page root component
export const PageShell: React.FC<Props> = ({
  pageContext,
  relayEnvironment,
  relayQueryRef,
  childComponent: ChildComponent,
}) => {
  const links = {
    '/': 'Home',
    '/repo/xiniha/vite-ssr-relay-template/issues': 'Issues',
    '/repo/xiniha/vite-ssr-relay-template/issues/create': 'Create Issue',
  }

  return (
    <React.StrictMode>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <PageContextProvider pageContext={pageContext}>
          <Layout>
            <Sidebar>
              <h1 className="my-4 text-2xl">
                Vite Plugin SSR + React 18 + Relay
              </h1>
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
                <React.Suspense fallback={'Loading...'}>
                  <ChildComponent queryRef={relayQueryRef} />
                </React.Suspense>
              </ErrorBoundary>
            </Content>
          </Layout>
        </PageContextProvider>
      </RelayEnvironmentProvider>
    </React.StrictMode>
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
