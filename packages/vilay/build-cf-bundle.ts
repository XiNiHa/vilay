import { buildWorker } from 'build-worker'

await Promise.all([
  buildWorker({
    entry: './server/cloudflare/workers.ts',
    out: './dist/cloudflare/workers.js',
    external: ['__STATIC_CONTENT_MANIFEST'],
  }),
  buildWorker({
    entry: './server/cloudflare/pages.ts',
    out: './dist/cloudflare/pages.js',
  }),
])
