import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { socialLinksService } from '../services/socialLinksService'
import { socialLinkKeys } from '../constants/queryKeys'

export function useSocialLinksQuery(portfolioId: string) {
  return useQuery({
    queryKey: socialLinkKeys.list(portfolioId),
    queryFn: () => socialLinksService.list(portfolioId),
    staleTime: STALE_TIME.short,
    enabled: Boolean(portfolioId),
  })
}
