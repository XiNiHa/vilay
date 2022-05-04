---
title: Page Exports
description: Documentation about Vilay's unique page exports
layout: ../../layouts/MainLayout.astro
---

For providing an easy-to-use API to users, Vilay uses page exports to customize the behavior of the framework.
Users can easily utilize these exports to use various features of Vilay.

Since Vilay is built on [vite-plugin-ssr](https://vite-plugin-ssr.com), users can also use every page exports provided by `vite-plugin-ssr` by default.

## How to Use

Users can export any kind of page exports in every page file (`.page.js/jsx/ts/tsx`).

```tsx
// _default.page.js
export const head = {
  title: 'My Vilay App', // This gets applied by default
}

// menu.page.js
export const head = {
  title: 'Menu - My Vilay App', // This gets applied when visiting `/menu`
}
```

## Available Exports

### `page`

Vilay renders the component exported as `Page` for the route.

```tsx
// index.page.js
export const Page = () => {
  return <h1>Hello world!</h1> // This will appear when visiting `/`
}
```

### `query`

Vilay provides various page exports that make integrating with Relay very easy and convenient.
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

### `getQueryVariables`

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

### `head`

Useful for setting `<head>` contents inside the page file. Updated in every page navigation.

- Meta tags are inserted as `<meta name="${KEY}" content="${VALUE}">`.
- Other tags are inserted as `<${KEY}>${VALUE}</${KEY}>`.

```tsx
export const head = {
  // <title>My Vilay App</title>
  title: 'My Vilay App',
  meta: {
    // <meta name="description" content="App built with Vilay">
    description: 'App built with Vilay',
  },
}
```
