import { useMutation, useQueryClient } from '@tanstack/react-query'
import { portfoliosService } from '../services/portfoliosService'
import { portfolioKeys } from '../constants/queryKeys'
import type { CreatePortfolioValues } from '../validation/portfolioSchema'

export function useCreatePortfolioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CreatePortfolioValues) =>
      portfoliosService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() })
    },
  })
}
