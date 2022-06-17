import { cwd } from 'node:process'
import type { PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import ssr from 'vite-plugin-ssr/plugin'
import swc from 'unplugin-swc'
import deepmerge from 'deepmerge'
import type { Config as RelayPluginConfig } from '@swc/plugin-relay'
import type { Config } from 'virtual:vilay:config'

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}

const configPlugin = (config: RecursivePartial<Config>): PluginOption => {
  const virtualModuleId = 'virtual:vilay:config'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  const defaultConfig: Config = {}
  const merged = deepmerge(defaultConfig, config)

  return {
    name: 'vilay:config',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(merged)}`
      }
    },
  }
}

const viteConfigPlugin: PluginOption = {
  name: 'vilay:overrideConfig',
  config: (config) => ({
    ...config,
    optimizeDeps: {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        'react-dom/client',
        'react-relay',
        '@vilay/render',
      ],
    },
  }),
}

const plugin = (config: RecursivePartial<Config> = {}): PluginOption[] => [
  react(),
  ssr({ pageFiles: { include: ['vilay'] } }),
  swc.vite({
    jsc: {
      experimental: {
        plugins: [
          [
            '@swc/plugin-relay',
            {
              rootDir: cwd(),
              language: 'typescript',
            } as RelayPluginConfig,
          ],
        ],
      },
    },
  }),
  configPlugin(config),
  viteConfigPlugin,
]

export default plugin
