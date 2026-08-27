// Re-exports the single generated Database type (from supabase/types, aliased
// as `@db`) plus ergonomic helper aliases. This is NOT a duplicate type
// definition — it is a thin, type-only surface so feature code imports from
// `@/shared/lib/supabase` instead of reaching outside `src`.
import type { Database } from '@db'

export type { Database }

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
