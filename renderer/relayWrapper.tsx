import React from 'react'
import {
  useRelayEnvironment,
  usePreloadedQuery,
  GraphQLTaggedNode,
  PreloadedQuery,
} from 'react-relay'
import type { Environment, OperationType, RenderPolicy } from 'relay-runtime'

const getInjectionScript = (env: Environment) => {
  const data = JSON.stringify(env.getStore().getSource())
  return `var d=${data};window.$updateRelay?window.$updateRelay(d):window.$caches=[].concat(window.$caches||[],d)`
}

const Context = React.createContext<{
  handler: ((p: Promise<unknown>) => unknown) | null
  state: Promise<unknown> | true | null,
}>({ handler: null, state: null })

const WrappedSuspense: React.FC<{ fallback: React.ReactNode }> = ({
  fallback,
  children,
}) => {
  const loadPromises = React.useRef<Promise<unknown>[]>([])
  const handler = React.useCallback((promise: Promise<unknown>) => {
    loadPromises.current.push(promise)
  }, [])

  return (
    <Context.Provider value={{ handler, state: null }}>
      <React.Suspense fallback={fallback ?? null}>
        {children}
        <InjectionScript promises={() => loadPromises.current} />
      </React.Suspense>
    </Context.Provider>
  )
}

const InjectionScript: React.FC<{
  promises: () => (Promise<unknown> | null)[]
}> = ({ promises }) => {
  const context = React.useContext(Context)
  const resolved = React.useRef<boolean>(false)
  if (promises().length > 0 && !resolved.current) {
    if (!context.state) {
      context.state =
        Promise.all(promises().filter(Boolean))
          .then(() => new Promise((resolve) => setTimeout(resolve, 2000)))
          .then(() => context.state = true)
    }
    if (context.state !== true) throw context.state
  }
  const relayEnvironment = useRelayEnvironment()

  return (
    relayEnvironment && (
      <script
        dangerouslySetInnerHTML={{
          __html: getInjectionScript(relayEnvironment),
        }}
      />
    )
  )
}

const useWrappedPreloadedQuery = <TQuery extends OperationType>(
  gqlQuery: GraphQLTaggedNode,
  preloadedQuery: PreloadedQuery<TQuery>,
  options?: {
    UNSTABLE_renderPolicy?: RenderPolicy | undefined
  }
) => {
  const context = React.useContext(Context)
  try {
    return usePreloadedQuery(gqlQuery, preloadedQuery, options)
  } catch (e) {
    if (e instanceof Promise) context.handler?.(e)
    throw e
  }
}

export {
  WrappedSuspense as Suspense,
  useWrappedPreloadedQuery as usePreloadedQuery,
}
