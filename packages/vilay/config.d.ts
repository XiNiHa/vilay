declare module 'virtual:vilay:config' {
  export interface Config {
    ssr: {
      initialSendTimeout: number
      abortTimeout: number
    }
  }
  const config: Config
  export default config
}
