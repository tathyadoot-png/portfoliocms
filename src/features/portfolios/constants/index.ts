import type { PortfolioStatus } from '../types'

export { portfolioKeys } from './queryKeys'

export const PORTFOLIO_STATUSES: readonly PortfolioStatus[] = [
  'active',
  'inactive',
]

/** Default theme identifier (maps to design tokens on the public site). */
export const DEFAULT_THEME = 'default'

/**
 * Maintained list of valid theme identifiers. This is deliberately a plain
 * text column in the database (not a DB enum) so new themes can be added
 * without a migration — validated here at the application layer instead.
 */
export const AVAILABLE_THEMES = [
  'default',
  'crimson',
  'green',
  'blue',
  'orange',
] as const
