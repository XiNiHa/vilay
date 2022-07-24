# Vilay Demo App

## Trying the demo app

1. Run `pnpm install` in the root of this repo.
2. Create a new [GitHub Personal Access Token](https://github.com/settings/tokens/new?scopes=repo).
3. Create `.env.local` file containing the token you just created. See `.env.example` for an example.
4. Run `pnpm run dev` and `pnpm run relay -w` in two separate terminals.
5. Open the URL logged in the first terminal and the app appears.

## Deploying to Cloudflare Workers

This example can be deployed to Cloudflare Workers.

1. Add your `account_id` in `wrangler.toml`.
2. Run `pnpx wrangler publish`.
