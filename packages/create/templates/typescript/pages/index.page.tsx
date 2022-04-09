import React, { Suspense } from 'react'
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay'
import PokemonSearch from '../components/PokemonSearch'
import { pagesPageQuery } from './__generated__/pagesPageQuery.graphql'
import './index.css'

interface Props {
  queryRef: PreloadedQuery<pagesPageQuery>
}

export const query = graphql`
  query pagesPageQuery {
    ...PokemonSearch_query
  }
`

export const Page: React.FC<Props> = ({ queryRef }) => {
  const data = usePreloadedQuery<pagesPageQuery>(query, queryRef)

  return (
    <main className="container">
      <h1>New Vilay App</h1>
      <p>Congratulations! You just successfully created a new Vilay app!</p>
      <p>
        Below is a sample app demonstrating the usage of Relay in Vilay apps,
        using PokeAPI.
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <PokemonSearch query={data} />
      </Suspense>
    </main>
  )
}
