#!/usr/bin/env node

import { cwd, argv } from 'node:process'
import { existsSync } from 'node:fs'
import {
  createServer as createDevServer,
  build,
  preview,
  type PluginOption,
} from 'vite'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { renderPage } from 'vite-plugin-ssr'
import { prerender } from 'vite-plugin-ssr/cli'
import { listen } from 'listhen'
import { createServer as createProdServer } from './server/index.js'

const workDir = cwd()

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
  .command('build', 'build for production', async () => {
    await build({ root: workDir })
    await build({ root: workDir, build: { ssr: true } })
    await prerender()
  })
  .command('start', 'launch production SSR server', async () => {
    if (!existsSync(`${workDir}/dist`)) {
      throw new Error('Call `build` before calling `start`.')
    }
    const app = await createProdServer(workDir)
    await listen(app, { port: 3000 })
  })
  .command(
    'preview',
    'launch a preview with production build',
    (yargs) => yargs.option('port', { default: 3000 }),
    async ({ port }) => {
      if (!existsSync(`${workDir}/dist/client/index.html`)) {
        throw new Error('Call `build` before calling `preview`.')
      }
      const previewServer = await preview({
        root: workDir,
        build: { outDir: 'dist/client' },
        preview: { host: true, port },
      })
      previewServer.printUrls()
    }
  )
  .parse()

function rendererPlugin(): PluginOption {
  return {
    name: 'vite-ssr-relay:rendererPlugin',
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
