@react.component
let make = (~type_=?, ~className=?, ~onClick=?, ~disabled=?, ~children) => {
  <button
    ?type_
    ?onClick
    ?disabled
    className={`border border-gray-500 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 ${className->Belt.Option.getWithDefault(
        "",
      )}`}>
    children
  </button>
}
