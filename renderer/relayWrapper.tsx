import React from 'react'
import {
  useRelayEnvironment,
  usePreloadedQuery,
  GraphQLTaggedNode,
  PreloadedQuery,
} from 'react-relay'
import type { Environment, OperationType, RenderPolicy } from 'relay-runtime'

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
  const resolved = React.useRef<boolean>(false)
  const id = React.useId()
  if (promises().length > 0 && !resolved.current) {
    if (!InjectionStateMap.has(id)) {
      InjectionStateMap.set(
        id,
        Promise.all(promises().filter(Boolean))
          .then(() => new Promise((resolve) => setTimeout(resolve, 2000)))
          .then(() => InjectionStateMap.set(id, true))
      )
    }
    const state = InjectionStateMap.get(id)
    if (state !== true) throw state
  }
  InjectionStateMap.delete(id)
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
