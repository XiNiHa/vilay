---
title: Advanced
description: Documentation about Vilay's advanced page exports
layout: ../../../layouts/MainLayout.astro
---

## `PageShell`

If you need to provide custom react provider composition, then `PageShell` is what you want to use. You probably only need it at the root level, but you could completely override the vilay `PageShell` and thus your providers for any other page.

`renderer/PageShell.tsx`:

```tsx
import React from 'react'
import { useRouteManager, VilayApp, type PageShellProps } from 'vilay'

// Custom PageShell component - add your contexts here!
export const PageShell: React.FC<PageShellProps> = ({
  relayEnvironment,
  routeManager,
}) => {
  const [CurrentPage, pageContext, queryRef, routeTransitioning] =
    useRouteManager(routeManager)
  const PageLayout =
    pageContext?.exports?.PageLayout ??
    pageContext?.exports?.pageLayout ??
    Passthrough
  return (
    <React.StrictMode>
      <VilayApp relayEnvironment={relayEnvironment} pageContext={pageContext}>
        <PageLayout routeTransitioning={routeTransitioning}>
          {CurrentPage && <CurrentPage queryRef={queryRef} />}
        </PageLayout>
      </VilayApp>
    </React.StrictMode>
  )
}

const Passthrough: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>
```
Important! To make sure your custom `PageShell` providers are used by your entire app, use `_default.page`

`renderer/_default.page.tsx`:

```tsx
import { PageShell } from './PageShell'
export default defineVilay({
  PageShell,
  PageLayout,
  initRelayEnvironment,
})
```