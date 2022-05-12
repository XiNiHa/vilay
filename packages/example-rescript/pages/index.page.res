%%raw(`import './index.css'`)

module Query = %relay(`
  query pagesIndexQuery {
    ...PokemonSearch_query
  }
`)

@react.component
let make = (~queryRef) => {
  let data = Query.usePreloaded(~queryRef, ())

  <main className="container">
    <h1> {React.string(`New Vilay App`)} </h1>
    <p> {React.string(`Congratulations! You just successfully created a new Vilay app!`)} </p>
    <p>
      {React.string(`Below is a sample app demonstrating the usage of Relay in Vilay apps, using PokeAPI.`)}
    </p>
    <React.Suspense fallback={<div> {React.string(`Loading...`)} </div>}>
      <PokemonSearch query={data.fragmentRefs} />
    </React.Suspense>
  </main>
}

let query = PagesIndexQuery_graphql.node
