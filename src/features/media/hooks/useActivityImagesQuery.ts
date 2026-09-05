import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

export function useActivityImagesQuery(
  portfolioId: string,
  activityId: string | undefined,
) {
  return useQuery({
    queryKey: [
      ...mediaKeys.all(portfolioId),
      'activity-images',
      activityId ?? '',
    ],
    queryFn: () => mediaService.listActivityImages(portfolioId, activityId!),
    staleTime: STALE_TIME.short,
    enabled: Boolean(portfolioId && activityId),
  })
}
