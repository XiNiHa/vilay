---
title: Vilay CLI
description: Documentation about the Vilay CLI
layout: ../../layouts/MainLayout.astro
---

Vilay provides a tiny CLI to interact with the framework.

## `dev`

Starts the dev server.

**Options**

- `--port`: Port to use for serving the dev server. Default: `3000`

## `build [env]`

Build for production.

**Options**

- `env`: Target environment to run the app. Choices: `node`, `cloudflare`. Default: `node`
- `--no-minify`: Skip minifying. Useful for debugging purpose. Default: `false`

## `start`

Launch production SSR server. Only works when user already built the app with the `build` command.
