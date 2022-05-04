export default {
  async fetch(
    request: Request,
    env: { ASSETS: { fetch: typeof fetch } }
  ): Promise<Response> {
    try {
      return handleFetchEvent(request, env)
    } catch (e) {
      console.log(e)
      return new Response('Internal Error', { status: 500 })
    }
  },
}

async function handleFetchEvent(
  request: Request,
  env: { ASSETS: { fetch: typeof fetch } }
): Promise<Response> {
  if (!isAssetUrl(request.url)) {
    const response = await handleSsr(request.url)
    if (response !== null) return response
  }

  return env.ASSETS.fetch(request)
}
function isAssetUrl(url: string) {
  const { pathname } = new URL(url)
  return pathname.startsWith('/assets/')
}

import { renderPage } from 'vite-plugin-ssr'

async function handleSsr(url: string) {
  const pageContextInit = { url, fetch }
  const pageContext = await renderPage(pageContextInit)
  const { httpResponse } = pageContext
  if (!httpResponse) {
    return null
  } else {    
    return new Response(httpResponse.getWebStream())
  }
}
