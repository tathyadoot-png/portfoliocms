import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { cloudinaryConfigService } from '../services/cloudinaryConfigService'
import { cloudinaryKeys } from '../constants/queryKeys'

export function useCloudinaryConfigQuery(portfolioId: string) {
  return useQuery({
    queryKey: cloudinaryKeys.detail(portfolioId),
    queryFn: () => cloudinaryConfigService.getByPortfolio(portfolioId),
    staleTime: STALE_TIME.medium,
  })
}
