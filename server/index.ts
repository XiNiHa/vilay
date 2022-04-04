import { CompatibilityEvent, createApp, sendError } from 'h3'
import path, { dirname } from 'path'
import serveStatic from 'serve-static'
import { fileURLToPath } from 'url'
import { renderPage } from 'vite-plugin-ssr'

const root = path.join(dirname(fileURLToPath(import.meta.url)), '..')

export async function createServer() {
  const app = createApp({ onError })

  // app.use(serveStatic(path.join(root, 'dist', 'client')))
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    if (req.url == null) return next(new Error('url is null'))

    renderPage({ url: req.url }).then((pageContext) => {
      const { httpResponse } = pageContext
      if (!httpResponse) return next()
      httpResponse.pipeToNodeWritable(res)
    })
  })

  return app
}

function onError(error: Error, event: CompatibilityEvent) {
  if (event.res.headersSent) {
    event.res.end()
    return
  }
  sendError(event.res, error, false)
}
