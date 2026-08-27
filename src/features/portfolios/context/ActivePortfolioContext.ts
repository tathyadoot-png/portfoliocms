import { createContext } from 'react'
import type { Portfolio } from '../types'

export interface ActivePortfolioContextValue {
  portfolio: Portfolio
}

export const ActivePortfolioContext = createContext<
  ActivePortfolioContextValue | undefined
>(undefined)
