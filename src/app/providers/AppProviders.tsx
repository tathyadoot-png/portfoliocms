import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'
import { queryClient } from '@/shared/lib/query-client'
import { AuthProvider } from '@/features/auth'

export interface AppProvidersProps {
  children: ReactNode
}

/** Composes global providers: server-state (TanStack Query), auth, and toasts. */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  )
}
