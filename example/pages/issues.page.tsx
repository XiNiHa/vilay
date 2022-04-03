import React from 'react'
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay'
import IssueListComponent from '../components/issues/IssueList'
import type { GetQueryVariables } from '../renderer/types'
import type {
  issuesPageQuery,
  issuesPageQueryVariables,
} from './__generated__/issuesPageQuery.graphql'

interface Props {
  queryRef: PreloadedQuery<issuesPageQuery>
}

interface RouteParams {
  owner: string
  name: string
}

// If a page has `getQueryVariables` exported, it'll be called to get the variables used for preloading the query.
// If it's not exported, route params will be directly used as variables.
export const getQueryVariables: GetQueryVariables<
  RouteParams,
  issuesPageQueryVariables
> = (routeParams) => ({
  ...routeParams,
  first: 10,
  filter: {},
})

// Variables used in this query is constructed using the `getQueryVariables()` on preload.
export const query = graphql`
  query issuesPageQuery(
    $owner: String!
    $name: String!
    $cursor: String
    $first: Int!
    $filter: IssueFilters
  ) {
    repository(name: $name, owner: $owner) {
      ...IssueList_repository
    }
  }
`

// Relay pagination example.
export const Page: React.FC<Props> = ({ queryRef }) => {
  const data = usePreloadedQuery<issuesPageQuery>(query, queryRef)

  return (
    <>
      <h2 className="text-2xl">Issues</h2>
      <p>This page is for demonstrating paginated queries.</p>
      {data.repository && (
        <React.Suspense fallback="Loading...">
          <IssueListComponent repository={data.repository} />
        </React.Suspense>
      )}
    </>
  )
}
