---
"vilay": patch
---

add new `getPageHead`. BREAKING CHANGE: replace `head` new `getPageHead()` method. For this and also now to `getQueryVariables` we provide the full `pageContext`, which is another breaking change. 

- `getQueryVariables: ({ routeParams })` instead of `getQueryVariables: (routeParams)`. 
- `getPageHead: () => ({ title: "My Site" })` instead of `head: { title: "My Site" }` 

see the docs for more info!
