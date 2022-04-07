import React from 'react'
import { graphql } from 'react-relay'
import { useLazyLoadQuery } from 'vite-ssr-relay/renderer/relayWrapper'
import type { GetQueryVariables } from 'vite-ssr-relay/types'
import { head as defaultHead } from '../renderer/_default.page'
import IssueListComponent from '../components/issues/IssueList'
import type {
  issuesPageQuery,
  issuesPageQuery$variables,
} from './__generated__/issuesPageQuery.graphql'

interface Props {
  variables: issuesPageQuery$variables
}

interface RouteParams {
  owner: string
  name: string
}

// This overrides the application-wide <head> tag definition in `_default.page.tsx`
export const head = { ...defaultHead, title: 'Issues: Vite SSR app' }

// If a page has `getQueryVariables` exported, it'll be called to get the variables used for preloading the query.
// If it's not exported, route params will be directly used as variables.
export const getQueryVariables: GetQueryVariables<
  RouteParams,
  issuesPageQuery$variables
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
export const Page: React.FC<Props> = ({ variables }) => {
  const data = useLazyLoadQuery<issuesPageQuery>(query, variables)

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
