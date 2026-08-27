import { useMutation, useQueryClient } from '@tanstack/react-query'
import { socialLinksService } from '../services/socialLinksService'
import { socialLinkKeys } from '../constants/queryKeys'

export function useDeleteSocialLinkMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => socialLinksService.remove(portfolioId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: socialLinkKeys.all(portfolioId),
      })
    },
  })
}
