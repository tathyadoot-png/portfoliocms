import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { ActivePortfolioContext } from '../context/ActivePortfolioContext'
import type { Portfolio } from '../types'

export interface ActivePortfolioProviderProps {
  portfolio: Portfolio
  children: ReactNode
}

/** Provides the already-resolved active portfolio to a subtree. Resolution and
 *  loading/error handling are done by PortfolioLayout. */
export function ActivePortfolioProvider({
  portfolio,
  children,
}: ActivePortfolioProviderProps) {
  const value = useMemo(() => ({ portfolio }), [portfolio])
  return (
    <ActivePortfolioContext.Provider value={value}>
      {children}
    </ActivePortfolioContext.Provider>
  )
}
