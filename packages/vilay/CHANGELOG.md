# vilay

## 0.0.27

### Patch Changes

- 770d597: Fix import without extension in ESM

## 0.0.26

### Patch Changes

- 1ef7975: Add pageContext.redirectTo support
- 5a4ea4d: Allow `CustomShell` component
- 931ae45: add new `getPageHead`. BREAKING CHANGE: replace `head` new `getPageHead()` method. For this and also now to `getQueryVariables` we provide the full `pageContext`, which is another breaking change.

  - `getQueryVariables: ({ routeParams })` instead of `getQueryVariables: (routeParams)`.
  - `getPageHead: () => ({ title: "My Site" })` instead of `head: { title: "My Site" }`

  see the docs for more info!

- Updated dependencies [1ef7975]
  - @vilay/render@0.0.27

## 0.0.25

### Patch Changes

- 2cc8eab: Update vite-plugin-ssr to 0.4 stable
- Updated dependencies [2cc8eab]
  - @vilay/render@0.0.26
