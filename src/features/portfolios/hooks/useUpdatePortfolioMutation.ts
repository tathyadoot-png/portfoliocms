import { useMutation, useQueryClient } from '@tanstack/react-query'
import { portfoliosService } from '../services/portfoliosService'
import { portfolioKeys } from '../constants/queryKeys'
import type { UpdatePortfolioValues } from '../validation/portfolioSchema'

export function useUpdatePortfolioMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: UpdatePortfolioValues) =>
      portfoliosService.update(portfolioId, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(portfolioKeys.detail(portfolioId), updated)
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() })
    },
  })
}
