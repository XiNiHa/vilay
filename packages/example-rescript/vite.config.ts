import type { UserConfig } from 'vite'
import vilay from 'vilay/plugin'
import { presetUno } from 'unocss'
import unocss from 'unocss/vite'

const config: UserConfig = {
  plugins: [
    vilay(),
    unocss({
      presets: [presetUno()],
      include: [/\.mjs$/],
    }),
  ],
  optimizeDeps: {
    include: ['react-dom/client', 'react-relay'],
  },
}

export default config
