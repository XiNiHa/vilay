import { renderPage } from 'vite-plugin-ssr'
import { getAssetFromKV, NotFoundError } from '@cloudflare/kv-asset-handler'
import { buildCloudflareHandler } from '@vilay/render'
import manifestJSON from '__STATIC_CONTENT_MANIFEST'

const assetManifest = JSON.parse(manifestJSON)

export default buildCloudflareHandler(async (request, env, ctx) => {
  try {
    const asset = await getAssetFromKV(
      {
        request,
        waitUntil: (promise) => {
          return ctx.waitUntil(promise)
        },
      },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
      }
    )

    return asset
  } catch (e) {
    if (e instanceof NotFoundError) {
      return new Response(null, { status: 404 })
    }
    return new Response(null, { status: 500 })
  }
}, renderPage)
