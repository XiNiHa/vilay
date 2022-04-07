import { join } from 'node:path'
import { CompatibilityEvent, createApp, sendError } from 'h3'
import serveStatic from 'serve-static'
import { renderPage } from 'vite-plugin-ssr'

export async function createServer(root: string) {
  const app = createApp({ onError })

  app.use(serveStatic(join(root, 'dist', 'client')))
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
