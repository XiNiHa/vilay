import { renderPage } from 'vite-plugin-ssr'

export async function render(url: string) {
  const pageContextInit = { url, fetch }
  const pageContext = await renderPage(pageContextInit)
  const { httpResponse } = pageContext
  if (!httpResponse) {
    return null
  } else {    
    return new Response(httpResponse.getWebStream())
  }
}
