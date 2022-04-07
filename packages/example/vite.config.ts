import type { UserConfig } from 'vite'
import viteSsrRelay from 'vite-ssr-relay/plugin'
import { presetUno } from 'unocss'
import unocss from 'unocss/vite'

const config: UserConfig = {
  plugins: [viteSsrRelay(), unocss({ presets: [presetUno()] })],
}

export default config
