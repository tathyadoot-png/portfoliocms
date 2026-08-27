import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

export function useReorderActivityGalleryMutation(
  portfolioId: string,
  activityId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      mediaService.reorderActivityGallery(portfolioId, activityId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all(portfolioId) })
    },
  })
}
