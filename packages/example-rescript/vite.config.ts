import type { UserConfig } from 'vite'
import vilay from 'vilay/plugin'

const config: UserConfig = {
  plugins: [vilay()],
  optimizeDeps: {
    include: ['react-dom/client', 'react-relay']
  }
}

export default config
