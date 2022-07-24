import { rm } from 'node:fs/promises'
import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

await rm('./dist', { recursive: true, force: true })

const external = [
  'react',
  'react-dom',
  'vite-plugin-ssr',
]

await Promise.all([
  esbuild.build({
    platform: 'node',
    entryPoints: ['index.ts'],
    outfile: './dist/node/index.cjs',
    format: 'cjs',
    target: 'es2020',
    bundle: true,
    minify: true,
    external,
  }),
  esbuild.build({
    platform: 'node',
    entryPoints: ['index.ts'],
    outfile: './dist/node/index.mjs',
    banner: {
      js: `import { createRequire } from 'module';const require=createRequire(import.meta.url);`
    },
    format: 'esm',
    target: 'es2020',
    bundle: true,
    minify: true,
    external,
  }),
  esbuild.build({
    plugins: [NodeModulesPolyfillPlugin()],
    platform: 'browser',
    conditions: ['worker', 'browser'],
    entryPoints: ['index.ts'],
    outfile: './dist/index.mjs',
    format: 'esm',
    target: 'es2020',
    bundle: true,
    minify: true,
    external,
    define: {
      IS_CLOUDFLARE_WORKER: 'true',
    },
  }),
])
