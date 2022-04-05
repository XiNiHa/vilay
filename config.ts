export default {
  // Meta tags are inserted as <meta name="<KEY>" content="<VALUE>">.
  // Other tags are inserted as <<KEY>><VALUE></<KEY>>.
  ssr: {
    initialSendTimeout: 0,
    abortTimeout: 5000,
  },
} as const
