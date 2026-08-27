import { useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioSettingsService } from '../services/portfolioSettingsService'
import { portfolioSettingsKeys } from '../constants/queryKeys'
import type { PortfolioSettingsValues } from '../validation/portfolioSettingsSchema'

export function useUpsertPortfolioSettingsMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: PortfolioSettingsValues) =>
      portfolioSettingsService.upsert(portfolioId, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(portfolioSettingsKeys.detail(portfolioId), updated)
    },
  })
}
