---
title: Relay
description: Documentation about Vilay's page exports for Relay
layout: ../../../layouts/MainLayout.astro
---

Vilay provides various page exports that make integrating with Relay very easy and convenient.
## `initRelayEnvironment`

`initRelayEnvironement` is used to tell Vilay the way to create a Relay Environment.

```ts
export const initRelayEnvironment = (
  isServer,
  fetch,
  records,
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
```

## `query`

`query` is the most basic export that tells Vilay to fetch the query before rendering the page.

```tsx
import { graphql, usePreloadedQuery } from 'react-relay'

export const query = graphql`
  query pagesPageQuery {
    foo {
      bar
    }
  }
`

export const Page = ({ queryRef }) => {
  const data = usePreloadedQuery(query, queryRef)

  return (
    <h1>{data.foo.bar}</h1>
  )
}
```

## `getQueryVariables`

While using Relay, it's pretty common to pass query variables for fetching data.
Vilay provides `getQueryVariables` to let users return variables to use, and also passes [route parameters](https://vite-plugin-ssr.com/filesystem-routing) to be used to figure out the right variables to use.

```tsx
// /@category/index.page.js
import { graphql, usePreloadedQuery } from 'react-relay'
import ItemsList from '../../components/ItemsList'

export const getQueryVariables = (routeParams) => ({
  ...routeParams,
  first: 10,
})

export const query = graphql`
  query CategoryPageQuery(
    $category: String!
    $first: Int!
    $after: String
  ) {
    category(name: $category) {
      ...ItemsList_category
    }
  }
`

export const Page = ({ queryRef }) => {
  const data = usePreloadedQuery(query, queryRef)

  return (
    <>
      <h1>Items</h1>
      <ItemsList items={data.category} />
    </>
  )
}
```
