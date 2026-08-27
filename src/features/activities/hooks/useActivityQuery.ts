import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { activitiesService } from '../services/activitiesService'
import { activityKeys } from '../constants/queryKeys'

export function useActivityQuery(portfolioId: string, activityId: string) {
  return useQuery({
    queryKey: activityKeys.detail(portfolioId, activityId),
    queryFn: () => activitiesService.getById(portfolioId, activityId),
    staleTime: STALE_TIME.short,
    enabled: Boolean(portfolioId && activityId),
  })
}
