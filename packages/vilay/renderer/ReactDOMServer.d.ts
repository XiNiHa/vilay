// This file should be removed once ReactDOM DefinitelyTyped starts to ship the definition for the Streaming SSR API.

import { ReactNode } from 'react'
import type { Writable } from 'stream'

declare module 'react-dom/server' {
  export function renderToPipeableStream(
    children: ReactNode,
    options?: {
      identifierPrefix?: string
      namespaceURI?: string
      nonce?: string
      bootstrapScriptContent?: string
      bootstrapScripts?: string[]
      bootstrapModules?: string[]
      progressiveChunkSize?: number
      onShellReady?: () => void
      onAllReady?: () => void
      onError?: (error: Error) => void
    }
  ): {
    abort(): void
    pipe<T extends Writable>(destination: T): T
  }
}
