import { useMutation, useQueryClient } from '@tanstack/react-query'
import { socialLinksService } from '../services/socialLinksService'
import { socialLinkKeys } from '../constants/queryKeys'
import type { SocialLinkWriteInput } from '../types'

export function useCreateSocialLinkMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SocialLinkWriteInput) =>
      socialLinksService.create(portfolioId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: socialLinkKeys.all(portfolioId),
      })
    },
  })
}
