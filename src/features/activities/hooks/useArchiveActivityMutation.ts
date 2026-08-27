import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activitiesService } from '../services/activitiesService'
import { activityKeys } from '../constants/queryKeys'

export function useArchiveActivityMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      activitiesService.archive(portfolioId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(portfolioId) })
    },
  })
}
