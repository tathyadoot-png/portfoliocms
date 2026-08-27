import { useMutation, useQueryClient } from '@tanstack/react-query'
import { socialLinksService } from '../services/socialLinksService'
import { socialLinkKeys } from '../constants/queryKeys'

export function useReorderSocialLinksMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      socialLinksService.reorder(portfolioId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: socialLinkKeys.all(portfolioId),
      })
    },
  })
}
