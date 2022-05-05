import { getAssetFromKV, NotFoundError } from '@cloudflare/kv-asset-handler'
import manifestJSON from '__STATIC_CONTENT_MANIFEST'
import { buildHandler } from './common'

const assetManifest = JSON.parse(manifestJSON)

export default buildHandler(async (request, env, ctx) => {
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
})
