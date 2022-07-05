import * as cookie from 'cookie-es'
import type { renderPage } from 'vite-plugin-ssr'

export async function render(req: Request, renderVps: typeof renderPage) {
  const cookieHeader = req.headers.get('Cookie')
  const pageContextInit = {
    url: req.url,
    cookies: cookieHeader != null ? cookie.parse(cookieHeader) : undefined,
    userAgent: req.headers.get('User-Agent'),
    fetch,
  }
  const pageContext = await renderVps(pageContextInit)
  const { httpResponse } = pageContext
  if (!httpResponse) {
    return null
  } else {
    const { contentType, statusCode } = httpResponse
    return new Response(httpResponse.getWebStream(), {
      status: statusCode,
      headers: {
        'Content-Type': `${contentType};charset=utf-8`,
        'Transfer-Encoding': 'chunked',
      },
    })
  }
}
