import { createClient } from '@supabase/supabase-js'
import { env } from '@/shared/lib/env'
import type { Database } from './types'

/**
 * The single typed Supabase client for the whole app. Uses the publishable
 * (anon) key only — the service_role key must never appear in frontend code.
 */
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
