import React, { Suspense } from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import Button from '../Button'
import IssueComponent from './Issue'
import type { IssueList_repository$key } from './__generated__/IssueList_repository.graphql'

interface Props {
  repository: IssueList_repository$key
}

// Component that renders the list of issues for the repository using Relay's `usePaginationFragment()`.
const IssueListComponent: React.FC<Props> = ({ repository }) => {
  const { data, loadNext, isLoadingNext, refetch } = usePaginationFragment(
    graphql`
      fragment IssueList_repository on Repository
      @refetchable(queryName: "IssueListPaginationQuery") {
        issues(
          after: $cursor
          first: $first
          orderBy: { field: CREATED_AT, direction: DESC }
          filterBy: $filter
        ) @connection(key: "issuesPageQuery_issues") {
          edges {
            node {
              ...Issue_issue
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
    repository
  )

  const [onlyOpened, setOnlyOpened] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (onlyOpened != null)
      // `startTransition()` keeps the previous content temporarily while the new content is loading.
      React.startTransition(() => {
        refetch({ filter: { states: onlyOpened ? 'OPEN' : null } })
      })
  }, [onlyOpened])

  return (
    <div className="py-4">
      <Button onClick={() => setOnlyOpened(!onlyOpened)}>
        Toggle opened filter: {onlyOpened ? 'ON' : 'OFF'}
      </Button>
      <ul className="list-disc">
        {(data.issues.edges ?? [])
          .map(
            (edge, i) =>
              edge?.node && (
                <li key={i} className="ml-4 my-2">
                  <Suspense fallback={'Issue loading...'}>
                    <IssueComponent issue={edge.node} />
                  </Suspense>
                </li>
              )
          )
          .filter(Boolean)}
      </ul>
      {isLoadingNext
        ? 'Loading more...'
        : data.issues.pageInfo.hasNextPage && (
            <Button onClick={() => loadNext(10)}>Load more</Button>
          )}
    </div>
  )
}

export default IssueListComponent
