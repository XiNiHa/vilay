---
title: Basic
description: Documentation about Vilay's basic page exports
layout: ../../../layouts/MainLayout.astro
---

## `page`

Vilay renders the component exported as `Page` for the route.

```tsx
// index.page.js
export const Page = () => {
  return <h1>Hello world!</h1> // This will appear when visiting `/`
}
```

## `head`

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
