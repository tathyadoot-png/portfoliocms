import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

export function useRestoreMediaMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mediaId: string) => mediaService.restore(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all(portfolioId) })
    },
  })
}
