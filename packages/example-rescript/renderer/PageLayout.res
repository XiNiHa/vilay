%%raw(`import '@unocss/reset/tailwind.css'`)
%%raw(`import 'uno.css'`)

@module("react-error-boundary") external errorBoundary: React.component<{..}> = "ErrorBoundary"

open Belt

module LoadingIndicator = {
  @react.component
  let make = (~transitioning) => {
    <div
      className="absolute left-0 right-0 top-0 h-2 bg-green-200 transition-opacity duration-300"
      style={ReactDOM.Style.make(~opacity=transitioning ? "100" : "0", ())}
    />
  }
}

module ErrorFallback = {
  @react.component
  let make = (~error) => {
    <> {React.string(`Error: ${error}`)} </>
  }
}

@react.component
let make = (
  ~children,
  // true while the route is transitioning with `startTransition()`
  ~routeTransitioning,
) => {
  let links = Js.Dict.fromArray([
    ("/", "Home"),
    ("/repo/xiniha/vilay/issues", "Issues"),
    ("/repo/xiniha/vilay/issues/create", "Create Issue"),
  ])

  <>
    <LoadingIndicator transitioning={routeTransitioning} />
    <div className="flex max-w-900px m-auto">
      <div className="p-5 flex-shrink-0 flex flex-col items-end leading-7">
        <h1 className="my-4 text-2xl"> {React.string("Vite SSR Relay")} </h1>
        {links
        ->Js.Dict.entries
        ->Array.map(((href, text)) =>
          <a
            href={href}
            key={href}
            className="text-base hover:text-1.05rem transition-all duration-300">
            {React.string(text)}
          </a>
        )
        ->React.array}
      </div>
      <div className="p-5 pb-12 border-l-2 border-#eee min-h-screen">
        {React.createElementVariadic(
          errorBoundary,
          {
            "FallbackComponent": ErrorFallback.make,
          },
          [<React.Suspense fallback={React.string("Loading...")}> {children} </React.Suspense>],
        )}
      </div>
    </div>
  </>
}
