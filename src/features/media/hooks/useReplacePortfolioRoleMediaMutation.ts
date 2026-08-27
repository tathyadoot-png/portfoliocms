import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CloudinaryUploadResult } from '@/shared/lib/cloudinary'
import { mediaService } from '../services/mediaService'
import { mediaKeys } from '../constants/queryKeys'
import type { PortfolioMediaRole } from '../types'

export function useReplacePortfolioRoleMediaMutation(
  portfolioId: string,
  role: PortfolioMediaRole,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (upload: CloudinaryUploadResult) =>
      mediaService.replacePortfolioRoleMedia(portfolioId, role, upload),
    onSuccess: (updated) => {
      queryClient.setQueryData(mediaKeys.byRole(portfolioId, role), updated)
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists(portfolioId) })
    },
  })
}
