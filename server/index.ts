import { createServer } from 'http'
import { createApp } from 'h3'
import serveStatic from 'serve-static'
import path from 'path'
import { createPageRenderer } from 'vite-plugin-ssr'

const isProduction = process.env.NODE_ENV === 'production'
const root = path.join(__dirname, '..')

startServer()

async function startServer() {
  const app = createApp()

  let viteDevServer
  if (isProduction) {
    app.use(serveStatic(path.join(root, 'dist', 'client')))
  } else {
    const vite = await import('vite')
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: 'ssr' },
    })
    app.use(viteDevServer.middlewares)
  }

  const renderPage = createPageRenderer({ viteDevServer, isProduction, root })
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    if (req.url == null) return next(new Error('url is null'))

    renderPage({ url: req.url }).then((pageContext) => {
      const { httpResponse } = pageContext
      if (!httpResponse) return next()

      httpResponse.pipeToNodeWritable(res)
    })
  })

  const port = process.env.PORT || 3000
  createServer(app).listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
