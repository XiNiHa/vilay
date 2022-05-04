import {
  Environment,
  Network,
  RecordSource,
  Store,
  type GraphQLResponse,
} from 'relay-runtime'
import type { InitRelayEnvironment } from 'vilay'

export const initRelayEnvironment: InitRelayEnvironment = (
  isServer,
  fetch,
  records
) => {
  const network = Network.create(async ({ text: query }, variables) => {
    // Replace this with your backend API URL
    const response = await fetch(`https://beta.pokeapi.co/graphql/v1beta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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

  return new Environment({
    configName: isServer ? 'server' : 'client',
    network,
    store,
  })
}