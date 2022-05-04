---
title: Try It Out
description: Docs for creating your first Vilay app!
layout: ../../layouts/MainLayout.astro
---

You can use `create-vilay` to create a new Vilay project:

```sh
$ npx create-vilay # yarn create vilay, pnpm dlx create-vilay, etc.
```

You'll be asked to choose a project directory and template. Then a new Vilay project will be created inside the directory you chose. `cd` into it, and install dependencies with your favorite package manager. (run `npm install` if none)

## Running the app

Since Vilay uses Relay, a GraphQL client made by Meta (Facebook), the Relay compiler should be running to build the app correctly. You can do this with `npm run relay -w`, which starts the Relay compiler in watch mode(which means that when you make changes in your files, the Relay compiler will automatically re-compile). Then you can start the development server with `npm run dev`. It'll emit the app URL, and when you visit it, you'll be able to see the app running!

## Building for production

Vilay supports emitting optimized bundles for production. Run `npm run build` to build the production bundle, and then it'll be emitted at `dist/`. Then you can run `npm run start` to start the production server.
