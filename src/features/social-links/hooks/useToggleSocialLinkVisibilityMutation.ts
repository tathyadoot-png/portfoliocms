import { useMutation, useQueryClient } from '@tanstack/react-query'
import { socialLinksService } from '../services/socialLinksService'
import { socialLinkKeys } from '../constants/queryKeys'

export function useToggleSocialLinkVisibilityMutation(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      socialLinksService.setVisibility(portfolioId, id, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: socialLinkKeys.all(portfolioId),
      })
    },
  })
}
