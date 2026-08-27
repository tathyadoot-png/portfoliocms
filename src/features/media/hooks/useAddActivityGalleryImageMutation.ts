import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CloudinaryUploadResult } from '@/shared/lib/cloudinary'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'

export function useAddActivityGalleryImageMutation(
  portfolioId: string,
  activityId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (upload: CloudinaryUploadResult) =>
      mediaService.addActivityGalleryImage(portfolioId, activityId, upload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all(portfolioId) })
    },
  })
}
