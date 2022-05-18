open Webapi.Fetch

exception Graphql_error(string)

@scope("import.meta.env") @val external githubToken: string = "VITE_GITHUB_TOKEN"

let init = (_, fetch, recordMap) => {
  RescriptRelay.Environment.make(
    ~network=RescriptRelay.Network.makePromiseBased(~fetchFunction=(operation, variables, _, _) => {
      Vilay.fetchWithInit(
        fetch,
        `https://api.github.com/graphql`,
        RequestInit.make(
          ~method_=Post,
          ~body=Js.Dict.fromArray([
            ("query", Js.Json.string(operation.text)),
            ("variables", variables),
          ])
          ->Js.Json.object_
          ->Js.Json.stringify
          ->BodyInit.make,
          ~headers=HeadersInit.make({
            "user-agent": "Vilay",
            "content-type": "application/json",
            "accept": "application/json",
            "authorization": `Bearer ${githubToken}`,
          }),
          (),
        ),
      ) |> Js.Promise.then_(resp =>
        if Response.ok(resp) {
          Response.json(resp)
        } else {
          Js.Promise.reject(Graphql_error(`Request Failed: ` ++ Response.statusText(resp)))
        }
      )
    }, ()),
    ~store=RescriptRelay.Store.make(
      ~source=RescriptRelay.RecordSource.make(~records=?recordMap, ()),
      ~gcReleaseBufferSize=10,
      (),
    ),
    (),
  )
}
