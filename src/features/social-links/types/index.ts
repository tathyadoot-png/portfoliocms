import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/shared/lib/supabase'

export type SocialLink = Tables<'social_links'>
export type SocialLinkInsert = TablesInsert<'social_links'>
export type SocialLinkUpdate = TablesUpdate<'social_links'>
export type SocialPlatform = Enums<'social_platform'>

export interface SocialLinkWriteInput {
  platform: SocialPlatform
  custom_label: string | null
  url: string
  is_visible: boolean
}
