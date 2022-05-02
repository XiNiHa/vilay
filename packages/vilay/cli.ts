#!/usr/bin/env node

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { cwd, argv } from 'node:process'
import { existsSync } from 'node:fs'
import { createServer as createDevServer, build, type PluginOption } from 'vite'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { renderPage } from 'vite-plugin-ssr'
import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { listen } from 'listhen'
import { createServer as createProdServer } from './server/node/index.js'

const workDir = cwd()
const srcDir = dirname(fileURLToPath(import.meta.url))

if (!existsSync(`${workDir}/package.json`)) {
  throw new Error(
    "The CLI should be called from your project's root directory."
  )
}

yargs(hideBin(argv))
  .command(
    'dev',
    'starts the dev server',
    (yargs) => yargs.option('port', { default: 3000 }),
    async ({ port }) => {
      const server = await createDevServer({
        root: workDir,
        plugins: [rendererPlugin()],
        server: { host: true, port },
      })
      await server.listen()
      server.printUrls()
    }
  )
  .command(
    'build',
    'build for production',
    (yargs) =>
      yargs.option('env', { choices: ['node', 'cloudflare'], default: 'node' }),
    async ({ env }) => {
      switch (env) {
        case 'node': {
          return void (await build({ root: workDir }))
        }
        case 'cloudflare': {
          await build({ root: workDir })
          await esbuild
            .build({
              plugins: [NodeModulesPolyfillPlugin()],
              platform: 'browser',
              conditions: ['node'],
              entryPoints: [join(srcDir, '../server/workers/index.ts')],
              sourcemap: true,
              bundle: true,
              minify: false,
              outfile: './dist/client/_worker.js',
              logLevel: 'warning',
              format: 'esm',
              target: 'es2020',
            })
            .then(() =>
              console.log(
                'Application built successfully for Cloudflare Workers!'
              )
            )
            .catch((e) =>
              console.log('Application build failed for Cloudflare Workers.', e)
            )
          break
        }
        default: {
          throw new Error(`Unknown environment: ${env}`)
        }
      }
    }
  )
  .command('start', 'launch production SSR server', async () => {
    if (!existsSync(`${workDir}/dist`)) {
      throw new Error('Call `build` before calling `start`.')
    }
    const app = await createProdServer(workDir)
    await listen(app, { port: 3000 })
  })
  .parse()

function rendererPlugin(): PluginOption {
  return {
    name: 'vilay:rendererPlugin',
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const pageContextInit = { url: req.originalUrl ?? '' }
          const pageContext = await renderPage(pageContextInit)
          const { httpResponse } = pageContext
          if (!httpResponse) return next()
          httpResponse.pipeToNodeWritable(res)
        })
      }
    },
  }
}
