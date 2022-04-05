// Export that has the name `PageLayout` is used as the layout component
export { PageLayout } from './PageLayout'

// Export that has the name `initRelayEnvironment` is used for initializing Relay Environment
export { initRelayEnvironment } from './RelayEnvironment'

// Application-wide <head> tags
// Meta tags are inserted as <meta name="${KEY}" content="${VALUE}">.
// Other tags are inserted as <${KEY}>${VALUE}</${KEY}>.
export const head = {
  title: 'Vite SSR app',
  meta: {
    description: 'App using Vite + vite-plugin-ssr',
  },
}
