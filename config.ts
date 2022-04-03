export default {
  // Meta tags are inserted as <meta name="<KEY>" content="<VALUE>">.
  // Other tags are inserted as <<KEY>><VALUE></<KEY>>.
  head: {
    title: 'Vite SSR app',
    meta: {
      description: 'App using Vite + vite-plugin-ssr',
    },
  },
  ssr: {
    initialSendTimeout: 0,
    abortTimeout: 5000,
  },
} as const
