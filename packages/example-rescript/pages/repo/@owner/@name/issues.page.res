// Variables used in this query is constructed using the `getQueryVariables()` on preload.
module Query = %relay(`
  query issuesPageQuery(
    $owner: String!
    $name: String!
    $cursor: String
    $first: Int!
  ) {
    repository(name: $name, owner: $owner) {
      ...IssueList_repository
    }
  }
`)

let default = Vilay.make(
  // This overrides the application-wide <head> tag definition in `_default.page.tsx`
  ~head=Js.Obj.assign(Head.head, {"title": "Issues: Vite SSR app"}),
  // If a page has `getQueryVariables` exported, it'll be called to get the variables used for preloading the query.
  // If it's not exported, route params will be directly used as variables.
  ~getQueryVariables=routeParams =>
    Query.makeVariables(~first=10, ~owner=routeParams["owner"], ~name=routeParams["name"], ()),
  (),
)

// Relay pagination example.
@react.component
let make = (~queryRef) => {
  let data = Query.usePreloaded(~queryRef, ())

  <>
    <h2 className="text-2xl"> {React.string(`Issues`)} </h2>
    <p> {React.string(`This page is for demonstrating paginated queries.`)} </p>
    {switch data.repository {
    | Some({fragmentRefs}) =>
      <React.Suspense fallback={React.string("Loading...")}>
        <IssueList repository={fragmentRefs} />
      </React.Suspense>
    | None => React.null
    }}
  </>
}

let query = IssuesPageQuery_graphql.node
