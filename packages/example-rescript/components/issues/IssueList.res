open Belt

module Fragment = %relay(`
  fragment IssueList_repository on Repository
  @refetchable(queryName: "IssueListPaginationQuery")
  @argumentDefinitions(
    filter: { type: "IssueFilters" }
  ) {
    issues(
      after: $cursor
      first: $first
      orderBy: { field: CREATED_AT, direction: DESC }
      filterBy: $filter
    ) @connection(key: "issuesPageQuery_issues") {
      edges {
        node {
          id
          ...Issue_issue
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`)

@react.component
let make = (~repository) => {
  let {data, loadNext, isLoadingNext, refetch} = Fragment.usePagination(repository)
  let (onlyOpened, setOnlyOpened) = React.useState(() => None)
  let (_, startTransition) = ReactExperimental.useTransition()

  React.useEffect1(() => {
    switch onlyOpened {
    | Some(onlyOpened) =>
      // `startTransition()` keeps the previous content temporarily while the new content is loading.
      startTransition(() => {
        refetch(
          ~variables=Fragment.makeRefetchVariables(
            ~filter=Some({
              states: onlyOpened ? Some([#OPEN]) : None,
              assignee: None,
              createdBy: None,
              labels: None,
              mentioned: None,
              milestone: None,
              since: None,
              viewerSubscribed: None,
            }),
            (),
          ),
          (),
        )->ignore
      })
    | _ => ()
    }
    None
  }, [onlyOpened])

  let toggleMsg = switch onlyOpened {
  | Some(true) => "ON"
  | _ => "OFF"
  }

  <div className="py-4">
    <Button onClick={_ => setOnlyOpened(prev => Some(!Option.getWithDefault(prev, false)))}>
      {React.string(`Toggle opened filter: ${toggleMsg}`)}
    </Button>
    <ul className="list-disc">
      {data.issues.edges
      ->Option.getWithDefault([])
      ->Array.keepMap(edge =>
        switch edge {
        | Some({node: Some({id, fragmentRefs})}) =>
          Some(
            <li key={id} className="ml-4 my-2">
              <React.Suspense fallback={React.string(`Issue loading...`)}>
                <Issue issue={fragmentRefs} />
              </React.Suspense>
            </li>,
          )
        | _ => None
        }
      )
      ->React.array}
    </ul>
    {switch (isLoadingNext, data.issues.pageInfo.hasNextPage) {
    | (true, _) => React.string(`Loading more...`)
    | (_, true) =>
      <Button onClick={_ => loadNext(~count=10, ())->ignore}> {React.string(`Load more`)} </Button>
    | _ => React.null
    }}
  </div>
}
