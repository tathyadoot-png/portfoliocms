import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { authService } from '../services/authService'
import { AuthContext, type AuthContextValue } from '../context/AuthContext'

export interface AuthProviderProps {
  children: ReactNode
}

/**
 * Resolves the initial Supabase session, keeps it in sync via the auth state
 * listener, and exposes sign-in/sign-out. `isLoading` stays true until the
 * first session resolution completes so route guards don't flash.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    authService
      .getSession()
      .then((initialSession) => {
        if (active) setSession(initialSession)
      })
      .catch(() => {
        if (active) setSession(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    const unsubscribe = authService.onAuthStateChange((nextSession) => {
      if (active) setSession(nextSession)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const nextSession = await authService.signInWithPassword(email, password)
    setSession(nextSession)
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signIn,
      signOut,
    }),
    [session, isLoading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
