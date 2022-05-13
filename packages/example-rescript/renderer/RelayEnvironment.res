open Webapi.Fetch

exception Graphql_error(string)

let init = (_, fetch, recordMap) => {
  RescriptRelay.Environment.make(
    ~network=RescriptRelay.Network.makePromiseBased(~fetchFunction=(operation, variables, _, _) => {
      Vilay.fetchWithInit(
        fetch,
        `https://beta.pokeapi.co/graphql/v1beta`,
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
            "content-type": "application/json",
            "accept": "application/json",
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
