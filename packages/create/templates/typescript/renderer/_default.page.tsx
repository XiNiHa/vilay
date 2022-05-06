import { defineVilay } from 'vilay'
import { initRelayEnvironment } from './RelayEnvironment'

export default defineVilay({
  // Export that has the name `initRelayEnvironment` is used for initializing Relay Environment
  initRelayEnvironment,
  // Application-wide <head> tags
  // Meta tags are inserted as <meta name="${KEY}" content="${VALUE}">.
  // Other tags are inserted as <${KEY}>${VALUE}</${KEY}>.
  head: {
    title: 'New Vilay App',
    meta: {
      description: 'Just created with create-vilay',
    },
  }
})
