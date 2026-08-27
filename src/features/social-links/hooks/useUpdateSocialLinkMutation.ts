import { useMutation, useQueryClient } from '@tanstack/react-query'
import { socialLinksService } from '../services/socialLinksService'
import { socialLinkKeys } from '../constants/queryKeys'
import type { SocialLinkWriteInput } from '../types'

export function useUpdateSocialLinkMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: SocialLinkWriteInput
    }) => socialLinksService.update(portfolioId, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: socialLinkKeys.all(portfolioId),
      })
    },
  })
}
