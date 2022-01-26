import React from 'react'

export const Page: React.FC<{ is404: boolean }> = ({ is404 }) => {
  if (is404) {
    return (
      <>
        <h1 className="text-xl">404 Page Not Found</h1>
        <p>This page could not be found.</p>
      </>
    )
  } else {
    return (
      <>
        <h1 className="text-xl">500 Internal Server Error</h1>
        <p>Something went wrong.</p>
      </>
    )
  }
}
