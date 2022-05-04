import { Component } from 'solid-js'
import 'solid-js/web'

const TableOfContents: Component<{
  headers: { depth: number; text: string; slug: string }[]
}> = ({ headers = [] }) => {
  return (
    <>
      <h2 class="heading">On this page</h2>
      <ul>
        <li class={`header-link depth-2`.trim()}>
          <a href="#overview">Overview</a>
        </li>
        {headers
          .filter(({ depth }) => depth > 1 && depth < 4)
          .map((header) => (
            <li class={`header-link depth-${header.depth}`.trim()}>
              <a href={`#${header.slug}`}>{header.text}</a>
            </li>
          ))}
      </ul>
    </>
  )
}

export default TableOfContents
