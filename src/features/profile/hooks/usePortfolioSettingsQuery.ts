import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { portfolioSettingsService } from '../services/portfolioSettingsService'
import { portfolioSettingsKeys } from '../constants/queryKeys'

export function usePortfolioSettingsQuery(portfolioId: string) {
  return useQuery({
    queryKey: portfolioSettingsKeys.detail(portfolioId),
    queryFn: () => portfolioSettingsService.getByPortfolio(portfolioId),
    staleTime: STALE_TIME.medium,
  })
}
