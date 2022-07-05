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
import { fetch } from 'undici'

const workDir = cwd()
const srcDir = dirname(fileURLToPath(import.meta.url))

if (!existsSync(join(workDir, 'package.json'))) {
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
      yargs
        .positional('env', {
          choices: ['node', 'cloudflare-pages', 'cloudflare-workers'],
          default: 'node',
        })
        .option('no-minify', { default: false }),
    async ({ env, noMinify }) => {
      const minify = !noMinify
      switch (env) {
        case 'node': {
          await build({ root: workDir, build: { minify } })
          await esbuild
            .build({
              platform: 'node',
              entryPoints: [join(srcDir, '../server/node/index.ts')],
              sourcemap: true,
              outfile: './dist/server/node.js',
              logLevel: 'warning',
              format: 'cjs',
              target: 'es2020',
              bundle: true,
              minify: !noMinify,
            })
            .then(() =>
              console.log('Application build successfully for Node.js!')
            )
            .catch((e) =>
              console.log('Application build failed for Node.js.', e)
            )
          break
        }
        case 'cloudflare-pages': {
          await build({ root: workDir, build: { minify } })
          await esbuild.build({
            plugins: [NodeModulesPolyfillPlugin()],
            platform: 'browser',
            conditions: ['worker', 'browser'],
            entryPoints: [join(srcDir, '../server/cloudflare/pages.ts')],
            sourcemap: true,
            outfile: './dist/client/_worker.js',
            logLevel: 'warning',
            format: 'esm',
            target: 'es2020',
            bundle: true,
            minify: !noMinify,
            define: {
              IS_CLOUDFLARE_WORKER: 'true'
            },
          })
            .then(() =>
              console.log(
                'Application built successfully for Cloudflare Pages Fullstack!'
              )
            )
            .catch((e) =>
              console.log(
                'Application build failed for Cloudflare Pages Fullstack.',
                e
              )
            )
          break
        }
        case 'cloudflare-workers': {
          await build({ root: workDir, build: { minify } })
          await esbuild.build({
            plugins: [NodeModulesPolyfillPlugin()],
            platform: 'browser',
            conditions: ['worker', 'browser'],
            entryPoints: [join(srcDir, '../server/cloudflare/workers.ts')],
            sourcemap: true,
            outfile: './dist/client/_worker.js',
            external: ['__STATIC_CONTENT_MANIFEST'],
            logLevel: 'warning',
            format: 'esm',
            target: 'es2020',
            bundle: true,
            minify: !noMinify,
            define: {
              IS_CLOUDFLARE_WORKER: 'true'
            },
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
    const scriptPath = join(workDir, 'dist/server/node.js')
    if (!existsSync(scriptPath)) {
      throw new Error('Call `build` before calling `start`.')
    }
    await import(scriptPath)
  })
  .parse()

function rendererPlugin(): PluginOption {
  return {
    name: 'vilay:rendererPlugin',
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const pageContextInit = {
            url: req.originalUrl ?? '',
            userAgent: req.headers['user-agent'],
            fetch,
          }
          const pageContext = await renderPage(pageContextInit)
          const { httpResponse } = pageContext
          if (!httpResponse) return next()
          const { contentType, statusCode } = httpResponse
          res.writeHead(statusCode, {
            'Content-Type': `${contentType};charset=utf-8`,
          })
          httpResponse.pipe(res)
        })
      }
    },
  }
}
