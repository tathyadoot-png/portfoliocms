import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CloudinaryUploadResult } from '@/shared/lib/cloudinary'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

export function useReplaceActivityCoverMutation(
  portfolioId: string,
  activityId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (upload: CloudinaryUploadResult) =>
      mediaService.replaceActivityCover(portfolioId, activityId, upload),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        mediaKeys.activityCover(portfolioId, activityId),
        updated,
      )
      queryClient.invalidateQueries({ queryKey: mediaKeys.all(portfolioId) })
    },
  })
}
