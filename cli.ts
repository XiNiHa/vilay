#!/usr/bin/env node

import { cwd, argv } from 'node:process'
import { existsSync } from 'node:fs'
import { build, createServer, preview, type PluginOption } from 'vite'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { createPageRenderer } from 'vite-plugin-ssr'
import { prerender } from 'vite-plugin-ssr/cli'

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
      const server = await createServer({
        root: workDir,
        plugins: [rendererPlugin()],
        server: {
          host: true,
          port,
        },
      })
      await server.listen()
      server.printUrls()
    }
  )
  .command('build', 'build for production', async () => {
    await build({
      root: workDir,
      build: { ssr: true },
    })
    await prerender()
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
        preview: {
          host: true,
          port,
        },
      })
      previewServer.printUrls()
    }
  )
  .parse()

function rendererPlugin(): PluginOption {
  let renderPage: ReturnType<typeof createPageRenderer>

  return {
    name: 'vite-ssr-relay:rendererPlugin',
    configureServer(server) {
      if (!renderPage)
        renderPage = createPageRenderer({
          viteDevServer: server,
          root: workDir,
          isProduction: false,
        })

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
