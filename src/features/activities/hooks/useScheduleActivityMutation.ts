import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activitiesService } from '../services/activitiesService'
import { activityKeys } from '../constants/queryKeys'

export function useScheduleActivityMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      activityId,
      publishAt,
    }: {
      activityId: string
      publishAt: string
    }) => activitiesService.schedule(portfolioId, activityId, publishAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(portfolioId) })
    },
  })
}
