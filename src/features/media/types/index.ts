import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/shared/lib/supabase'

// Domain types are derived from the generated Database type — never hand-written.
export type Media = Tables<'media'>
export type MediaInsert = TablesInsert<'media'>
export type MediaUpdate = TablesUpdate<'media'>
export type MediaRole = Enums<'media_role'>
export type MediaKind = Enums<'media_kind'>

/** Portfolio-level roles (activity_id is always null for these). */
export type PortfolioMediaRole = Extract<MediaRole, 'profile' | 'cover' | 'favicon'>

/** Activity-level roles stored on the shared `media` table. */
export type ActivityMediaRole = Extract<MediaRole, 'cover' | 'gallery'>

export interface MediaListFilters {
  role?: MediaRole
  kind?: MediaKind
  includeDeleted?: boolean
  activityId?: string
}

export interface MediaMetadataInput {
  alt_text_en?: string | null
  alt_text_hi?: string | null
  caption_en?: string | null
  caption_hi?: string | null
}
