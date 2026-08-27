import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activitiesService } from '../services/activitiesService'
import { activityKeys } from '../constants/queryKeys'
import type { ActivityWriteInput } from '../types'

export function useUpdateActivityMutation(
  portfolioId: string,
  activityId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ActivityWriteInput) =>
      activitiesService.update(portfolioId, activityId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        activityKeys.detail(portfolioId, activityId),
        updated,
      )
      queryClient.invalidateQueries({ queryKey: activityKeys.lists(portfolioId) })
    },
  })
}
