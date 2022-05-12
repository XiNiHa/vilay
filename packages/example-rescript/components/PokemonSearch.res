open Belt

module Fragment = %relay(`
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
`)

@react.component
let make = (~query) => {
  let (data, refetch) = Fragment.useRefetchable(query)
  let (_, startTransition) = ReactExperimental.useTransition()

  <>
    <input
      onChange={e =>
        startTransition(() =>
          refetch(~variables={name: Some(ReactEvent.Form.target(e)["value"])}, ())->ignore
        )}
    />
    <ul className="pokemons">
      {data.pokemon_v2_pokemon
      ->Array.map(pokemon =>
        <li key={pokemon.name}>
          <p> {React.string(`Name: ${pokemon.name}`)} </p>
          <p>
            {React.string(
              `Types: ${pokemon.pokemon_v2_pokemontypes
                ->Array.map(t => t.pokemon_v2_type->Option.map(t => t.name))
                ->Array.keep(Option.isSome)
                ->Array.joinWith(`, `, Option.getExn)}`,
            )}
          </p>
        </li>
      )
      ->React.array}
    </ul>
  </>
}
