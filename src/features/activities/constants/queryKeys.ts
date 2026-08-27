import type { ActivityListFilters } from '../types'

/**
 * Query key factory for activities. ALWAYS portfolio-scoped — every key
 * embeds portfolioId so switching portfolios never leaks cached activities.
 */
export const activityKeys = {
  all: (portfolioId: string) => ['activities', portfolioId] as const,
  lists: (portfolioId: string) =>
    [...activityKeys.all(portfolioId), 'list'] as const,
  list: (portfolioId: string, filters: ActivityListFilters = {}) =>
    [...activityKeys.lists(portfolioId), filters] as const,
  details: (portfolioId: string) =>
    [...activityKeys.all(portfolioId), 'detail'] as const,
  detail: (portfolioId: string, activityId: string) =>
    [...activityKeys.details(portfolioId), activityId] as const,
}
