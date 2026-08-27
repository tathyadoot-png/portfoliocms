import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

/** Cover thumbnails only — never gallery images. */
export function useActivityCoversQuery(
  portfolioId: string,
  activityIds: string[],
) {
  return useQuery({
    queryKey: mediaKeys.activityCovers(portfolioId, activityIds),
    queryFn: () => mediaService.listActivityCovers(portfolioId, activityIds),
    staleTime: STALE_TIME.short,
    enabled: Boolean(portfolioId) && activityIds.length > 0,
  })
}
