export const SITE = {
  title: 'Vilay',
  description:
    'Vite SSR framework with support for React SSR streaming and Relay.',
  defaultLanguage: 'en_US',
}

export const OPEN_GRAPH = {
  image: undefined
  /*
  image: {
    src: 'https://github.com/withastro/astro/blob/main/assets/social/banner.jpg?raw=true',
    alt:
      'astro logo on a starry expanse of space,' +
      ' with a purple saturn-like planet floating in the right foreground',
  },
  */
}

export const KNOWN_LANGUAGES = {
  English: 'en',
}

// Uncomment this to add an "Edit this page" button to every page of documentation.
export const GITHUB_REPO_NAME = `XiNiHa/vilay`
export const GITHUB_REPO_BRANCH = 'main'
export const GITHUB_PAGES_PATH = 'packages/docs/src/pages'

// Uncomment this to add an "Join our Community" button to every page of documentation.
export const COMMUNITY_INVITE_URL = undefined
// export const COMMUNITY_INVITE_URL = `https://astro.build/chat`;

// Uncomment this to enable site search.
// See "Algolia" section of the README for more information.
export const ALGOLIA = undefined
// export const ALGOLIA = {
//   indexName: 'XXXXXXXXXX',
//   appId: 'XXXXXXXXXX',
//   apiKey: 'XXXXXXXXXX',
// }

export const SIDEBAR = {
  en: [
    { text: '', header: true },
    { text: 'Getting Started', header: true },
    { text: 'Introduction', link: 'en/introduction' },
    { text: 'Try It Out', link: 'en/try-it-out' },

    { text: 'Reference', header: true },
    { text: 'Page Exports', link: 'en/page-exports' },
    { text: 'Vilay CLI', link: 'en/cli' },
  ],
}
