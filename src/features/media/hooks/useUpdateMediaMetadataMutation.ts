import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'
import type { MediaMetadataInput } from '../types'

export function useUpdateMediaMetadataMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      mediaId,
      metadata,
    }: {
      mediaId: string
      metadata: MediaMetadataInput
    }) => mediaService.updateMetadata(mediaId, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all(portfolioId) })
    },
  })
}
