import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activitiesService } from '../services/activitiesService'
import { activityKeys } from '../constants/queryKeys'
import type { ActivityWriteInput } from '../types'

export function useCreateActivityMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ActivityWriteInput) =>
      activitiesService.create(portfolioId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(portfolioId) })
    },
  })
}
