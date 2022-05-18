// Query for fetching the repository's ID.
module Query = %relay(`
  query createIssueQuery($owner: String!, $name: String!) {
    repository(name: $name, owner: $owner) {
      id
    }
  }
`)

module Mutation = %relay(`
  mutation createIssueMutation($input: CreateIssueInput!) {
    createIssue(input: $input) {
      issue {
        number
      }
    }
  }
`)

@react.component
let make = (~queryRef) => {
  let data = Query.usePreloaded(~queryRef, ())
  let (commit, isInFlight) = Mutation.use()

  let onFormSubmit = e => {
    ReactEvent.Form.preventDefault(e)

    let title = ReactEvent.Form.target(e)["title"]
    let body = ReactEvent.Form.target(e)["body"]

    switch data.repository {
    | Some({id}) =>
      commit(
        ~variables=Mutation.makeVariables(
          ~input=Mutation.make_createIssueInput(
            ~repositoryId=id,
            ~title=title,
            ~body=body,
            (),
          ),
        ),
        ~onCompleted=res => {
          switch res.createIssue {
          | Some({issue: Some({number})}) =>
            Webapi.Dom.Window.alert(Webapi.Dom.window, j`Issue created with number #$number`)
          | _ => Webapi.Dom.Window.alert(Webapi.Dom.window, `Something went wrong!`)
          }
          _ => ()
        },
        ~onError=err => {
          Webapi.Dom.Window.alert(Webapi.Dom.window, `Something went wrong: ${err.message}`)
        },
        (),
      )->ignore
    | _ => Webapi.Dom.Window.alert(Webapi.Dom.window, `Please fill out the form.`)
    }
  }

  <form onSubmit={onFormSubmit}>
    <div className="my-2">
      <label htmlFor="title-input"> {React.string(`Title`)} </label>
      <input
        id="title-input"
        type_="text"
        name="title"
        required=true
        className="mx-2 border-b border-gray-500"
      />
    </div>
    <div className="my-2">
      <label htmlFor="body-input"> {React.string(`Body`)} </label>
      <br />
      <textarea
        id="body-input"
        name="body"
        className="my-1 border border-gray-500 rounded-xl p-3 resize-none"
        placeholder="Write something..."
      />
    </div>
    <Button type_="submit" disabled={isInFlight}>
      {React.string(isInFlight ? `Creating...` : `Create`)}
    </Button>
  </form>
}

let query = CreateIssueQuery_graphql.node
