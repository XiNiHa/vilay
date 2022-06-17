import { render } from './render'
import type { renderPage } from 'vite-plugin-ssr'

type Env = { ASSETS: { fetch: typeof fetch }; __STATIC_CONTENT: unknown }
type AssetHandler = ExportedHandlerFetchHandler<Env>

export const buildHandler = (
  assetHandler: AssetHandler,
  renderVps: typeof renderPage
): ExportedHandler<Env> => ({
  async fetch(...args): Promise<Response> {
    try {
      return handleFetchEvent(args, assetHandler, renderVps)
    } catch (e) {
      console.log(e)
      return new Response('Internal Error', { status: 500 })
    }
  },
})

async function handleFetchEvent(
  args: Parameters<ExportedHandlerFetchHandler<Env>>,
  assetHandler: AssetHandler,
  renderVps: typeof renderPage
): Promise<Response> {
  const [request] = args
  if (!isAssetUrl(request.url)) {
    const response = await render(request, renderVps)
    if (response !== null) return response
  }

  return assetHandler(...args)
}
function isAssetUrl(url: string) {
  const { pathname } = new URL(url)
  return pathname.startsWith('/assets/')
}
