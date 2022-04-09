import React, { startTransition } from 'react'
import { graphql, useRefetchableFragment } from 'react-relay'
import { PokemonSearch_query$key } from './__generated__/PokemonSearch_query.graphql'

interface Props {
  query: PokemonSearch_query$key
}

const PokemonSearch: React.FC<Props> = ({ query }) => {
  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment PokemonSearch_query on query_root
      @refetchable(queryName: "PokemonSearchRefetchQuery")
      @argumentDefinitions(name: { type: "String", defaultValue: "pikachu" }) {
        pokemon_v2_pokemon(where: { name: { _regex: $name } }) {
          name
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
            }
          }
        }
      }
    `,
    query
  )

  return (
    <>
      <input
        type="text"
        value="pikachu"
        onChange={(e) =>
          startTransition(() => {
            refetch({ name: e.target.value })
          })
        }
      />
      <ul className="pokemons">
        {data.pokemon_v2_pokemon?.map((pokemon) => (
          <li key={pokemon.name}>
            <p>Name: {pokemon.name}</p>
            <p>
              Types:{' '}
              {pokemon.pokemon_v2_pokemontypes
                .map((type) => type.pokemon_v2_type?.name)
                .filter(Boolean)
                .join(', ')}
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}

export default PokemonSearch
