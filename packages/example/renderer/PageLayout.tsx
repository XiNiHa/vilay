import React from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { usePageContext } from 'vilay'
import type { PageLayoutProps } from 'vilay'
import '@unocss/reset/tailwind.css'
import 'uno.css'

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  // true while the route is transitioning with `startTransition()`
  routeTransitioning,
}) => {
  const links = {
    '/': 'Home',
    '/repo/xiniha/vilay/issues': 'Issues',
    '/repo/xiniha/vilay/issues/create': 'Create Issue',
  }

  const context = usePageContext()

  return (
    <>
      <LoadingIndicator transitioning={routeTransitioning} />
      <div className="flex max-w-900px m-auto">
        <div className="p-5 flex-shrink-0 flex flex-col items-end leading-7">
          <h1 className="my-4 text-2xl">Vite SSR Relay</h1>
          {Object.entries(links).map(([href, text]) => (
            <a
              href={href}
              key={href}
              className={`text-base hover:text-1.05rem transition-all duration-300 border-b-1px ${
                // show a basic active state based on currentPath state
                context?.urlParsed?.pathname === href ? 'border-b-dark' : 'border-b-transparent'
              } `}
            >
              {text}
            </a>
          ))}
        </div>
        <div className="p-5 pb-12 border-l-2 border-#eee min-h-screen">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <React.Suspense fallback={'Loading...'}>{children}</React.Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </>
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

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  return <>Error: {error.message}</>
}
