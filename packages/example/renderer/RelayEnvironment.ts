import {
  Environment,
  GraphQLResponse,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime'
import type { InitRelayEnvironment } from 'vilay'

// Init relay environment
export const initRelayEnvironment: InitRelayEnvironment = (
  isServer,
  fetch,
  records
): Environment => {
  const network = Network.create(async ({ text: query }, variables) => {
    // Using GitHub API for example
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        // CF Workers don't append any User Agent, and GitHub API requires it
        ...(typeof window === 'undefined' ? { 'User-Agent': 'Vilay' } : undefined),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (response.status !== 200) {
      console.error(await response.text())
      throw new Error('Relay Network Error: Invalid response from server')
    }

    return (await response.json()) as GraphQLResponse
  })

  const source = new RecordSource(records)
  const store = new Store(source, { gcReleaseBufferSize: 10 })

  // Client environment gets cached by the framework
  return new Environment({
    configName: isServer ? 'server' : 'client',
    network,
    store,
  })
}
