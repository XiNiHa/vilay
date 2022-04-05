import {
  Network,
  Store,
  RecordSource,
  Environment,
  type GraphQLResponse,
} from 'relay-runtime'
import { fetch } from 'ohmyfetch'
import { InitRelayEnvironment } from '../types'

let relayEnvironment: Environment | null = null

// Init relay environment
export const initRelayEnvironment: InitRelayEnvironment = (
  isServer,
  records
): Environment => {
  const network = Network.create(async ({ text: query }, variables) => {
    // Replace this with your own fetching logic
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
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

  if (isServer) {
    return new Environment({
      configName: 'server',
      network,
      store,
    })
  }

  // Reuse Relay environment on client-side
  if (!relayEnvironment) {
    relayEnvironment = new Environment({
      configName: 'client',
      network,
      store,
    })
  }

  return relayEnvironment
}
