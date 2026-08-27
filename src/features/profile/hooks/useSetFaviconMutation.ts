import { useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioSettingsService } from '../services/portfolioSettingsService'
import { portfolioSettingsKeys } from '../constants/queryKeys'

export function useSetFaviconMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (faviconMediaId: string | null) =>
      portfolioSettingsService.setFaviconMediaId(portfolioId, faviconMediaId),
    onSuccess: (updated) => {
      queryClient.setQueryData(portfolioSettingsKeys.detail(portfolioId), updated)
    },
  })
}
