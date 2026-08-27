import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

export function useSoftDeleteMediaMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mediaId: string) => mediaService.softDelete(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all(portfolioId) })
    },
  })
}
