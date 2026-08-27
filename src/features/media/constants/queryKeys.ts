import type { MediaListFilters, PortfolioMediaRole } from '../types'

/**
 * Query key factory for media. ALWAYS portfolio-scoped — every key embeds
 * portfolioId so switching the active portfolio never surfaces another
 * portfolio's cached media.
 */
export const mediaKeys = {
  all: (portfolioId: string) => ['media', portfolioId] as const,
  lists: (portfolioId: string) => [...mediaKeys.all(portfolioId), 'list'] as const,
  list: (portfolioId: string, filters: MediaListFilters = {}) =>
    [...mediaKeys.lists(portfolioId), filters] as const,
  details: (portfolioId: string) =>
    [...mediaKeys.all(portfolioId), 'detail'] as const,
  detail: (portfolioId: string, mediaId: string) =>
    [...mediaKeys.details(portfolioId), mediaId] as const,
  /** The single active portfolio-level image for a role (profile/cover/favicon). */
  byRole: (portfolioId: string, role: PortfolioMediaRole) =>
    [...mediaKeys.all(portfolioId), 'role', role] as const,
  activityCover: (portfolioId: string, activityId: string) =>
    [...mediaKeys.all(portfolioId), 'activity-cover', activityId] as const,
  activityGallery: (
    portfolioId: string,
    activityId: string,
    filters: Pick<MediaListFilters, 'includeDeleted'> = {},
  ) =>
    [
      ...mediaKeys.all(portfolioId),
      'activity-gallery',
      activityId,
      filters,
    ] as const,
  activityCovers: (portfolioId: string, activityIds: string[]) =>
    [
      ...mediaKeys.all(portfolioId),
      'activity-covers',
      [...activityIds].sort().join(','),
    ] as const,
}
