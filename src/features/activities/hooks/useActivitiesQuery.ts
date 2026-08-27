import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { activitiesService } from '../services/activitiesService'
import { activityKeys } from '../constants/queryKeys'
import type { ActivityListFilters } from '../types'

export function useActivitiesQuery(
  portfolioId: string,
  filters: ActivityListFilters = {},
) {
  return useQuery({
    queryKey: activityKeys.list(portfolioId, filters),
    queryFn: () => activitiesService.list(portfolioId, filters),
    staleTime: STALE_TIME.short,
    enabled: Boolean(portfolioId),
  })
}
