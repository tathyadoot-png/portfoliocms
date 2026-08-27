import { useQuery } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'
import type { PortfolioMediaRole } from '../types'

/** The current active portfolio-level image (profile/cover/favicon) for a role. */
export function usePortfolioRoleMediaQuery(
  portfolioId: string,
  role: PortfolioMediaRole,
) {
  return useQuery({
    queryKey: mediaKeys.byRole(portfolioId, role),
    queryFn: () => mediaService.getActiveByRole(portfolioId, role),
    staleTime: STALE_TIME.short,
  })
}
