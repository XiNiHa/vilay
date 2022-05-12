import { renderPage } from 'vite-plugin-ssr'

export async function render(url: string) {
  const pageContextInit = { url, fetch }
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
