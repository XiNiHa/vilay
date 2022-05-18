open Belt

module Fragment = %relay(`
  fragment Issue_issue on Issue {
    title
    author {
      login
    }
    createdAt
    url
  }
`)

@react.component
let make = (~issue) => {
  let data = Fragment.use(issue)

  <div>
    <a href={data.url} className="text-lg underline transition-colors hover:text-gray-500">
      <h3> {React.string(data.title)} </h3>
    </a>
    <p> {React.string(data.author->Option.mapWithDefault("", a => a.login))} </p>
    <p> {React.string(data.createdAt->Js.Date.fromString->Js.Date.toLocaleString)} </p>
  </div>
}
