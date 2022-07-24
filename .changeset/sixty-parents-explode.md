---
"vilay": minor
---

add new `getPageHead`. BREAKING CHANGE: for the new `getPageHead` and `getQueryVariables` we provide the full `pageContext`. use `getQueryVariables: ({ routeParams })` instead of `getQueryVariables: (routeParams)`. see the docs for more info!
