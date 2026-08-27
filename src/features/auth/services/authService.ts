import { supabase } from '@/shared/lib/supabase'
import type { Session } from '@supabase/supabase-js'

/** All Supabase Auth calls live here; components/hooks never call supabase.auth. */
export const authService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<Session | null> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data.session
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /** Subscribes to auth changes; returns an unsubscribe function. */
  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
    return () => data.subscription.unsubscribe()
  },
}
