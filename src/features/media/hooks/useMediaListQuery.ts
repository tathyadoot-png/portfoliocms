import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'
import type { MediaListFilters } from '../types'

export function useMediaListQuery(
  portfolioId: string,
  filters: MediaListFilters = {},
) {
  return useQuery({
    queryKey: mediaKeys.list(portfolioId, filters),
    queryFn: () => mediaService.list(portfolioId, filters),
    staleTime: STALE_TIME.short,
  })
}
