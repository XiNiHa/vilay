import React, { useContext } from 'react'
import type { PageContext } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Context = React.createContext<PageContext>(undefined as any)

interface Props {
  pageContext: PageContext
  children: React.ReactNode
}

export const PageContextProvider: React.FC<Props> = ({
  pageContext,
  children,
}) => {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>
}

export const usePageContext = () => {
  const pageContext = useContext(Context)
  return pageContext
}
