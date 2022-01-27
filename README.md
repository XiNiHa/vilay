# vite-ssr-relay-template

English | [한국어](README.ko.md)

## Main Features

- Based on Vite and vite-plugin-ssr
- Uses React 18, Suspense SSR Streaming enabled by default
- Deep integration with Relay (Supports render-as-you-fetch)
- Easy to customize

## Others

- Yarn Berry (PNPM linker)
- TypeScript
- Prettier & ESLint
- UnoCSS

## TODO

- Runtimes for edge enviroments like Cloudflare Workers
- Image optimization
- Improve usability

## Setup

You should have these installed:

- Node.js
- Yarn

1. Clone this repository.
2. Run `yarn` to install dependencies.

> Latest version (v13.0.1) of `relay-compiler` has [an issue with ESM in some features](https://github.com/facebook/relay/issues/3726), which breaks pagination in Vite environment.
>
> This issue was fixed in https://github.com/facebook/relay/commit/8ac91d7e9783af11e0f6aef545d3cb5e206d3372,
> therefore, before the version with the fix is ready, you can build `facebook/relay/compiler` by yourself and
> replace the binary at `node_modules/relay-compiler/<OS_ARCH>` to temporarily work around the issue.

## NPM Scripts

- `dev`: Runs dev server in local. The script is located at `server/index.ts`, and it runs in Node.js.
- `prod`: Runs `build` script, and then `server:prod`.
- `build`: Builds client and server bundle using Vite. Required for running production server.
- `server:prod`: Runs a production server. Build required before running.
- `relay`: Launches the Relay compiler. `-w` option can be used for watching file changes.
- `lint`: Runs ESLint for user code.
- `format`: Runs Prettier for user's JS/TS code.

## Trying the demo app

1. Create a new [GitHub Personal Access Token](https://github.com/settings/tokens/new?scopes=repo).
2. Create `.env.local` file containing the token you just created. See `.env.example` for an example.
3. Run `yarn dev` and `yarn relay -w` in two separate terminals.
4. Open the URL logged in the first terminal and the app appears.

## File Structure

```sh
components/        # Components used in the demo app
  issues/
    IssueList.tsx  # Issue list component, includes Relay pagination example
    Issue.tsx      # Issue item component, uses Relay fragment
  Button.tsx       # Common button component
pages/                        # Pages used in the demo app
  index.page.tsx              # Example page for basic data fetching using Relay.
  issues.page.route.tsx       # Route definition for /repo/:owner/:name/issues page.
  issues.page.tsx             # Example page for data fetching with route params.
  createIssue.page.route.tsx  # Route definition for /repo/:owner/:name/issues/create page.
  createIssue.page.tsx        # Example page for basic mutation using Relay.
renderer/                   # Files used as a base for the app
  _default.page.client.tsx  # Client-side initialization script, performs things like hydration.
  _default.page.server.tsx  # Server-side per-request script, performs things like SSR.
  _error.page.tsx           # Basic error page
  ErrorFallback.tsx         # Fallback component used in React ErrorBoundary
  PageShell.tsx             # Root component that contains some providers and layout components
  ReactDOMServer.d.ts       # Type definitions for React 18's Streaming SSR API
  RelayEnvironment.tsx      # Relay Environment definition
  types.ts                  # Common type definitions
  usePageContext.tsx        # React provider and hook for vite-plugin-ssr's PageContext
server/
  index.ts        # Server launch script
config.ts         # Misc configs used in the template.
relay.config.js   # Relay configurations
schema.graphql    # GraphQL Schema used in Relay, includes GitHub API schema by default.
vite.config.ts    # Vite configurations
```

Additional comments are provided in each file.
