import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/shared/lib/supabase'

export type Activity = Tables<'activities'>
export type ActivityInsert = TablesInsert<'activities'>
export type ActivityUpdate = TablesUpdate<'activities'>
export type ActivityStatus = Enums<'activity_status'>

export interface ActivityListFilters {
  search?: string
  status?: ActivityStatus
  isFeatured?: boolean
  includeDeleted?: boolean
  activityDateFrom?: string
  activityDateTo?: string
}

export interface ActivityWriteInput {
  slug: string
  title_en: string
  title_hi: string
  description_en: string | null
  description_hi: string | null
  location_en: string | null
  location_hi: string | null
  activity_date: string | null
  display_date: string | null
  status: ActivityStatus
  publish_at: string | null
  is_featured: boolean
  sort_order: number
}
