import { renderPage } from 'vite-plugin-ssr'
import { buildCloudflareHandler } from '@vilay/render'

export default buildCloudflareHandler(
  (request, env) => env.ASSETS.fetch(request),
  renderPage
)
