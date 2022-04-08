import type { UserConfig } from 'vite'
import vilay from 'vilay/plugin'
import { presetUno } from 'unocss'
import unocss from 'unocss/vite'

const config: UserConfig = {
  plugins: [vilay(), unocss({ presets: [presetUno()] })],
}

export default config
