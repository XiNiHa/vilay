type pageLayoutProps = {
  children: React.element,
  routeTransitioning: bool,
}

type fetchFn

@module("./util.js")
external fetch: (fetchFn, string) => Js.Promise.t<Webapi.Fetch.response> = "callWithArgs"
@module("./util.js")
external fetchWithInit: (
  fetchFn,
  string,
  Webapi.Fetch.requestInit,
) => Js.Promise.t<Webapi.Fetch.response> = "callWithArgs"
@module("./util.js")
external fetchWithRequest: (fetchFn, Webapi.Fetch.request) => Js.Promise.t<Webapi.Fetch.response> =
  "callWithArgs"
@module("./util.js")
external fetchWithRequestInit: (
  . fetchFn,
  Webapi.Fetch.request,
  Webapi.Fetch.requestInit,
) => Js.Promise.t<Webapi.Fetch.response> = "callWithArgs"

type exports

@obj
external make: (
  ~pageLayout: React.component<pageLayoutProps>=?,
  ~initRelayEnvironment: (
    bool,
    fetchFn,
    option<RescriptRelay.recordSourceRecords>,
  ) => RescriptRelay.Environment.t=?,
  ~page: React.component<Js.Types.obj_val>=?,
  ~head: {..}=?,
  ~query: RescriptRelay.queryNode<Js.Types.obj_val>=?,
  ~getQueryVariables: Js.Types.obj_val => Js.Types.obj_val=?,
  unit,
) => exports = ""
