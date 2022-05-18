open Belt

module Query = %relay(`
  query pagesIndexQuery {
    repository(owner: "XiNiHa", name: "vilay") {
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
`)

@react.component
let make = (~queryRef) => {
  let data = Query.usePreloaded(~queryRef, ())

  let listItems = [
    <> {React.string(`Name: ${data.repository->Option.mapWithDefault("", r => r.name)}`)} </>,
    <>
      {React.string(
        `Stars: ${data.repository->Option.mapWithDefault(0, r => r.stargazerCount)->Int.toString}`,
      )}
    </>,
    <>
      {React.string(
        `
        Issues: ${data.repository
          ->Option.mapWithDefault(0, r => r.issues.totalCount)
          ->Int.toString} (${data.repository
          ->Option.mapWithDefault(0, r => r.openedIssues.totalCount)
          ->Int.toString} open)
      `,
      )}
    </>,
  ]

  <>
    <h2 className="text-2xl mb-4"> {React.string(`Welcome!`)} </h2>
    <p>
      {React.string(`
        This is the main page for the template, rendered with some of the
        actual information about the template repository:
      `)}
    </p>
    <ul className="pl-4">
      {listItems
      ->Array.mapWithIndex((i, item) =>
        <li
          key={Int.toString(i)}
          className="my-2 w-fit list-disc border-b border-black border-dashed hover:bg-blue-50 transition-colors duration-400">
          {item}
        </li>
      )
      ->React.array}
    </ul>
  </>
}

let query = PagesIndexQuery_graphql.node
