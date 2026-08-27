import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cloudinaryConfigService } from '../services/cloudinaryConfigService'
import { cloudinaryKeys } from '../constants/queryKeys'
import type { CloudinaryConfigValues } from '../validation/cloudinaryConfigSchema'

export function useUpsertCloudinaryConfigMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CloudinaryConfigValues) =>
      cloudinaryConfigService.upsert(portfolioId, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(cloudinaryKeys.detail(portfolioId), updated)
    },
  })
}
