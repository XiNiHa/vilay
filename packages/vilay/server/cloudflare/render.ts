import { renderPage } from 'vite-plugin-ssr'
import * as cookie from 'cookie-es'

export async function render(req: Request) {
  const cookieHeader = req.headers.get('Cookie')
  const pageContextInit = {
    url: req.url,
    cookies: cookieHeader != null ? cookie.parse(cookieHeader) : undefined,
    fetch,
  }
  const pageContext = await renderPage(pageContextInit)
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
