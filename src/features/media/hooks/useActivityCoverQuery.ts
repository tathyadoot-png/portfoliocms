import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

export function useActivityCoverQuery(portfolioId: string, activityId: string) {
  return useQuery({
    queryKey: mediaKeys.activityCover(portfolioId, activityId),
    queryFn: () => mediaService.getActivityCover(portfolioId, activityId),
    staleTime: STALE_TIME.short,
    enabled: Boolean(portfolioId && activityId),
  })
}
