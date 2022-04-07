import React from 'react'
import {
  useRelayEnvironment,
  usePreloadedQuery,
  useLazyLoadQuery,
  type PreloadedQuery,
} from 'react-relay'
import type {
  GraphQLTaggedNode,
  CacheConfig,
  Environment,
  FetchPolicy,
  OperationType,
  RenderPolicy,
  VariablesOf,
} from 'relay-runtime'

const InjectionStateMap = new Map<string, true | Promise<unknown> | null>()

const getInjectionScript = (env: Environment) => {
  const data = JSON.stringify(env.getStore().getSource())
  return `var d=${data};window.$updateRelay?window.$updateRelay(d):window.$caches=[].concat(window.$caches||[],d)`
}

const Context = React.createContext<{
  handler: ((p: Promise<unknown>) => unknown) | null
}>({ handler: null })

const WrappedSuspense: React.FC<{ fallback: React.ReactNode }> = ({
  fallback,
  children,
}) => {
  const loadPromises = React.useRef<Promise<unknown>[]>([])
  const handler = React.useCallback((promise: Promise<unknown>) => {
    loadPromises.current.push(promise)
  }, [])

  return (
    <Context.Provider value={{ handler }}>
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
  const id = React.useId()
  const isInitialRender = React.useRef(true)
  if (promises().length > 0) {
    let state = InjectionStateMap.get(id)
    if (!state) {
      state = Promise.all(promises().filter(Boolean))
        // .then(() => new Promise((resolve) => setTimeout(resolve, 2000)))
        .then(() => InjectionStateMap.set(id, true))
      InjectionStateMap.set(id, state)
    }
    if (state !== true) throw state
  }
  const relayEnvironment = useRelayEnvironment()
  const isServer = typeof window === 'undefined'

  if (isServer) InjectionStateMap.delete(id)
  React.useEffect(() => { InjectionStateMap.delete(id) })
  
  const renderScript = isServer || isInitialRender.current
  React.useEffect(() => { isInitialRender.current = false }, [])

  return (
    relayEnvironment &&
    (renderScript || null) && (
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

const useWrappedLazyLoadQuery = <TQuery extends OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: VariablesOf<TQuery>,
  options?: {
    fetchKey?: string | number | undefined
    fetchPolicy?: FetchPolicy | undefined
    networkCacheConfig?: CacheConfig | undefined
    UNSTABLE_renderPolicy?: RenderPolicy | undefined
  }
) => {
  const context = React.useContext(Context)
  try {
    return useLazyLoadQuery(gqlQuery, variables, options)
  } catch (e) {
    if (e instanceof Promise) context.handler?.(e)
    throw e
  }
}

export {
  WrappedSuspense as Suspense,
  useWrappedPreloadedQuery as usePreloadedQuery,
  useWrappedLazyLoadQuery as useLazyLoadQuery,
}
