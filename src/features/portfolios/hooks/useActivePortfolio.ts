import { useContext } from 'react'
import { ActivePortfolioContext } from '../context/ActivePortfolioContext'
import type { Portfolio } from '../types'

/** Returns the resolved active portfolio. Only valid inside PortfolioLayout. */
export function useActivePortfolio(): Portfolio {
  const context = useContext(ActivePortfolioContext)
  if (!context) {
    throw new Error(
      'useActivePortfolio must be used within an ActivePortfolioProvider',
    )
  }
  return context.portfolio
}
