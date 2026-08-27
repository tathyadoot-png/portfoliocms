import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activitiesService } from '../services/activitiesService'
import { activityKeys } from '../constants/queryKeys'

export function useSoftDeleteActivityMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      activitiesService.softDelete(portfolioId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(portfolioId) })
    },
  })
}
