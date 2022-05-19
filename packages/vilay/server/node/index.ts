import { join } from 'node:path'
import { CompatibilityEvent, createApp, sendError, useCookies } from 'h3'
import serveStatic from 'serve-static'
import { renderPage } from 'vite-plugin-ssr'
import { fetch } from 'undici'

export async function createServer(root: string) {
  const app = createApp({ onError })

  app.use(serveStatic(join(root, 'dist', 'client')))
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    if (req.url == null) return next(new Error('url is null'))
    const pageContextInit = {
      url: req.url,
      cookies: useCookies(req),
      fetch,
    }
    renderPage(pageContextInit).then((pageContext) => {
      const { httpResponse } = pageContext
      if (!httpResponse) return next()
      const { contentType, statusCode } = httpResponse
      res.writeHead(statusCode, {
        'Content-Type': `${contentType};charset=utf-8`,
      })
      httpResponse.pipe(res)
    })
  })

  return app
}

function onError(error: Error, event: CompatibilityEvent) {
  if (event.res.headersSent) {
    event.res.end()
    return
  }
  sendError(event, error, false)
}
