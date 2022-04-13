import { RecordSource, Environment } from 'relay-runtime'

// eslint-disable-next-line @typescript-eslint/ban-types
type Cache = Record<string, Record<string, {}>>

declare global {
  interface Window {
    relayEnv?: Environment
    $updateRelay?: (cache: Cache) => void
    $caches?: Cache[]
  }
}

window.$updateRelay = (cache) =>
  window.relayEnv?.getStore().publish(new RecordSource(cache))

if (window.$caches?.length && window.relayEnv) {
  window.$caches.forEach(window.$updateRelay)
  delete window.$caches
}
