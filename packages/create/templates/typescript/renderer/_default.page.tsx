// Export that has the name `initRelayEnvironment` is used for initializing Relay Environment
export { initRelayEnvironment } from './RelayEnvironment'

// Application-wide <head> tags
// Meta tags are inserted as <meta name="${KEY}" content="${VALUE}">.
// Other tags are inserted as <${KEY}>${VALUE}</${KEY}>.
export const head = {
  title: 'New Vilay App',
  meta: {
    description: 'Just created with create-vilay',
  },
}
