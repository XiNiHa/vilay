---
title: Basic
description: Documentation about Vilay's basic page exports
layout: ../../../layouts/MainLayout.astro
---

## `Page`

Vilay renders the component exported as `Page` for the route.

```tsx
// index.page.js
export const Page = () => {
  return <h1>Hello world!</h1> // This will appear when visiting `/`
}
```

## `PageLayout`

Vilay uses `PageLayout` export to render the layout of the app. Like other page exports, this is completely overridden from values defined in your `_default`.

```tsx
export const PageLayout = ({
  children,
  // true while the route is transitioning with `startTransition()`
  routeTransitioning,
}) => {
  return (
    <>
      {routeTransitioning && 'Loading...'}
      <Suspense fallback="Loading...">{children}</Suspense>
    </>
  )
}
```

## `getPageHead`

A dynamic equivalent of `head` module
This method provides the full page context so that you can construct head tags from full page context before the stream is initiated

Expects a return object like above

```tsx
// /@location/index.page.js
import { graphql, usePreloadedQuery } from 'react-relay'
import ItemsList from '../../components/ItemsList'

export const getPageHead = ({ routeParams, urlParsed }) => {
  const firstVisit = urlParsed?.search?.firstVisit

  return {
    title: firstVisit
        ? `Welcome to ${routeParams.location}!`
        : `Welcome back to ${routeParams.location}!`,
    },
  }
}
```
