import React from 'react'
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay'
import { defineVilay } from 'vilay'
import IssueListComponent from '../../../../../components/issues/IssueList'
import type {
  issuesPageQuery,
  issuesPageQuery$variables,
} from './__generated__/issuesPageQuery.graphql'

interface Props {
  queryRef: PreloadedQuery<issuesPageQuery>
}

interface RouteParams {
  owner: string
  name: string
}

// Variables used in this query are constructed using the `getQueryVariables()` on preload.
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

export default defineVilay<{
  PageProps: Props
  RouteParams: RouteParams
  QueryVariables: issuesPageQuery$variables
}>({
  query,
  // If a page has `getQueryVariables` exported, it'll be called to get the variables used for preloading the query.
  // If it's not exported, route params will be directly used as variables.
  getQueryVariables: ({ routeParams, urlParsed }) => {
    return {
      ...routeParams,
      first: urlParsed?.search?.first ? parseInt(urlParsed?.search?.first) : 10,
      filter: {},
    }
  },
  // This overrides the application-wide <head> tag definition in `_default.page.tsx`
  getPageHead: ({ routeParams }) => {
    return {
      title: `Issues for ${routeParams.owner}/${routeParams.name}`
    }
  },
  // Relay pagination example.
  Page: ({ queryRef }) => {
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
  },
})
