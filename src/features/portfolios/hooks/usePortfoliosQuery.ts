import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { portfoliosService } from '../services/portfoliosService'
import { portfolioKeys } from '../constants/queryKeys'
import type { PortfolioListFilters } from '../types'

export function usePortfoliosQuery(filters: PortfolioListFilters = {}) {
  return useQuery({
    queryKey: portfolioKeys.list(filters),
    queryFn: () => portfoliosService.list(filters),
    staleTime: STALE_TIME.medium,
  })
}
