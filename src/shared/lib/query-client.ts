import { QueryClient } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/constants'

/**
 * App-wide TanStack Query client. This is an internal CMS, not a live feed, so
 * window-focus refetching is disabled and stale times lean generous.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME.medium,
      retry: 1,
    },
  },
})
