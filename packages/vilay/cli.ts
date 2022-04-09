#!/usr/bin/env node

import { cwd, argv } from 'node:process'
import { existsSync } from 'node:fs'
import { createServer as createDevServer, build, type PluginOption } from 'vite'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { renderPage } from 'vite-plugin-ssr'
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
  })
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
