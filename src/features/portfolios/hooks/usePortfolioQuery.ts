import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { portfoliosService } from '../services/portfoliosService'
import { portfolioKeys } from '../constants/queryKeys'

export function usePortfolioQuery(portfolioId: string | undefined) {
  return useQuery({
    queryKey: portfolioKeys.detail(portfolioId ?? ''),
    queryFn: () => portfoliosService.getById(portfolioId as string),
    enabled: Boolean(portfolioId),
    staleTime: STALE_TIME.medium,
  })
}
