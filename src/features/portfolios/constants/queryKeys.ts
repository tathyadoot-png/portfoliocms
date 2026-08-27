import type { PortfolioListFilters } from '../types'

/**
 * Query key factory for portfolios. Portfolios are the top-level (tenant)
 * entity, so their keys are NOT portfolio-scoped. Portfolio-SCOPED resources
 * added in later phases (activities, media, …) must embed portfolioId in their
 * own keys to avoid leaking cache across portfolios.
 */
export const portfolioKeys = {
  all: ['portfolios'] as const,
  lists: () => [...portfolioKeys.all, 'list'] as const,
  list: (filters: PortfolioListFilters = {}) =>
    [...portfolioKeys.lists(), filters] as const,
  details: () => [...portfolioKeys.all, 'detail'] as const,
  detail: (portfolioId: string) =>
    [...portfolioKeys.details(), portfolioId] as const,
}
