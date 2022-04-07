import React from 'react'
import { graphql, type PreloadedQuery } from 'react-relay'
import { useLazyLoadQuery } from 'vite-ssr-relay'
import { pagesPageQuery } from './__generated__/pagesPageQuery.graphql'

interface Props {
  queryRef: PreloadedQuery<pagesPageQuery>
}

// If a page has `query` exported, it will be prefetched and SSR'd.
export const query = graphql`
  query pagesPageQuery {
    repository(owner: "XiNiHa", name: "vite-ssr-relay") {
      name
      stargazerCount
      issues(first: 0) {
        totalCount
      }
      openedIssues: issues(first: 0, filterBy: { states: OPEN }) {
        totalCount
      }
    }
  }
`

// Basic data fetching example using Relay.
export const Page: React.FC<Props> = () => {
  // This will either pull the preloaded data or suspend.
  const data = useLazyLoadQuery<pagesPageQuery>(query, {})

  const listItems = [
    <>Name: {data.repository?.name}</>,
    <>Stars: {data.repository?.stargazerCount}</>,
    <>
      Issues: {data.repository?.issues.totalCount} (
      {data.repository?.openedIssues.totalCount} open)
    </>,
  ]

  return (
    <>
      <h2 className="text-2xl mb-4">Welcome!</h2>
      <p>
        This is the main page for the template, rendered with some of the actual
        information about the template repository:
      </p>
      <ul className="pl-4">
        {listItems.map((item, i) => (
          <li
            key={i}
            className="my-2 w-fit list-disc border-b border-black border-dashed hover:bg-blue-50 transition-colors duration-400"
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  )
}
