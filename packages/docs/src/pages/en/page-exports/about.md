---
title: Page Exports
description: Documentation about Vilay's unique page exports
layout: ../../../layouts/MainLayout.astro
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
