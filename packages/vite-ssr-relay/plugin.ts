import type { PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import ssr from 'vite-plugin-ssr/plugin'
import relay from 'babel-plugin-relay'
import { transformSync } from '@babel/core'

const config: PluginOption[] = [
  react(),
  ssr({ pageFiles: { include: ['vite-ssr-relay'] } }),
  {
    name: 'vite-ssr-relay:relay',
    transform(src, id) {
      let code = src
      if (/.(t|j)sx?/.test(id) && src.includes('graphql`')) {
        const out = transformSync(src, {
          plugins: [[relay, { eagerEsModules: true }]],
          code: true,
        })
        if (!out?.code) throw new Error('Vite Relay transpilation failed')
        code = out.code
      }
      return { code, map: null }
    },
  },
]

export default config
