import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ssr from 'vite-plugin-ssr/plugin'
import relay from 'vite-plugin-relay'
import unocss from 'unocss/vite'
import { presetUno } from 'unocss'

const config: UserConfig = {
  plugins: [react(), ssr(), relay, unocss({ presets: [presetUno()] })],
}

export default config
