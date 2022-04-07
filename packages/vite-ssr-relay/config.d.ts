declare module 'virtual:vite-ssr-relay:config' {
  export interface Config {
    ssr: {
      initialSendTimeout: number
      abortTimeout: number
    }
  }
  const config: Config
  export default config
}
