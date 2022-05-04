#!/usr/bin/env node

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { cwd, argv } from 'node:process'
import { existsSync } from 'node:fs'
import { createServer as createDevServer, build, type PluginOption } from 'vite'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { renderPage } from 'vite-plugin-ssr'
import { buildWorker } from 'build-worker'
import { listen } from 'listhen'
import { fetch } from 'undici'
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
    'build [env]',
    'build for production',
    (yargs) =>
      yargs.positional('env', {
        choices: ['node', 'cloudflare'],
        default: 'node',
      }).option('no-minify', { default: false }),
    async ({ env, noMinify }) => {
      const minify = !noMinify
      switch (env) {
        case 'node': {
          return void (await build({ root: workDir, build: { minify } }))
        }
        case 'cloudflare': {
          await build({ root: workDir, build: { minify } })
          await buildWorker({
            entry: join(srcDir, '../server/workers/index.ts'),
            out: './dist/client/_worker.js',
            debug: noMinify,
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
          const pageContextInit = { url: req.originalUrl ?? '', fetch }
          const pageContext = await renderPage(pageContextInit)
          const { httpResponse } = pageContext
          if (!httpResponse) return next()
          httpResponse.pipeToNodeWritable(res)
        })
      }
    },
  }
}
