import { defineVilay } from 'vilay'
import { PageLayout } from './PageLayout'
import { initRelayEnvironment } from './RelayEnvironment'
import { PageShell } from './PageShell'

export default defineVilay({
  // Export that has the name `PageShell` is used as custom shell component, for adding providers
  PageShell,
  // Export that has the name `PageLayout` is used as the layout component
  PageLayout,
  // Export that has the name `initRelayEnvironment` is used for initializing Relay Environment
  initRelayEnvironment,
  // Application-wide <head> tags
  // Meta tags are inserted as <meta name="${KEY}" content="${VALUE}">.
  // Other tags are inserted as <${KEY}>${VALUE}</${KEY}>.
  getPageHead: () => ({
    title: 'Vite SSR app',
    meta: {
      description: 'App using Vite + vite-plugin-ssr',
    },
  }),
})
