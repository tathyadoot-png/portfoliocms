import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

export function useActivityGalleryQuery(
  portfolioId: string,
  activityId: string,
  includeDeleted = false,
) {
  return useQuery({
    queryKey: mediaKeys.activityGallery(portfolioId, activityId, {
      includeDeleted,
    }),
    queryFn: () =>
      mediaService.listActivityGallery(portfolioId, activityId, includeDeleted),
    staleTime: STALE_TIME.short,
    enabled: Boolean(portfolioId && activityId),
  })
}
