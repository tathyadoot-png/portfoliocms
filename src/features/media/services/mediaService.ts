import { supabase } from '@/shared/lib/supabase'
import type { CloudinaryUploadResult } from '@/shared/lib/cloudinary'
import type {
  Media,
  MediaInsert,
  MediaListFilters,
  MediaMetadataInput,
  PortfolioMediaRole,
} from '../types'

/**
 * All Supabase access for the `media` table. Every function requires an
 * explicit portfolioId — there is no global/mutable "current portfolio"
 * state, so a caller can never accidentally query across portfolios.
 *
 * Cloudinary assets are never deleted from here — only Supabase `media` rows
 * are soft-deleted (deleted_at). This matches the V1 decision to never call
 * Cloudinary's destructive APIs.
 */
export const mediaService = {
  async list(portfolioId: string, filters: MediaListFilters = {}): Promise<Media[]> {
    let query = supabase.from('media').select('*').eq('portfolio_id', portfolioId)

    if (!filters.includeDeleted) {
      query = query.is('deleted_at', null)
    }
    if (filters.role) {
      query = query.eq('role', filters.role)
    }
    if (filters.kind) {
      query = query.eq('kind', filters.kind)
    }
    if (filters.activityId) {
      query = query.eq('activity_id', filters.activityId)
    }

    const { data, error } = await query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /** The single active (non-deleted) portfolio-level image for a role. */
  async getActiveByRole(
    portfolioId: string,
    role: PortfolioMediaRole,
  ): Promise<Media | null> {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .is('activity_id', null)
      .eq('role', role)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async softDelete(mediaId: string): Promise<void> {
    const { error } = await supabase
      .from('media')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', mediaId)

    if (error) throw error
  },

  async restore(mediaId: string): Promise<void> {
    const { error } = await supabase
      .from('media')
      .update({ deleted_at: null })
      .eq('id', mediaId)

    if (error) throw error
  },

  async updateMetadata(mediaId: string, input: MediaMetadataInput): Promise<Media> {
    const { data, error } = await supabase
      .from('media')
      .update({
        alt_text_en: input.alt_text_en || null,
        alt_text_hi: input.alt_text_hi || null,
        caption_en: input.caption_en || null,
        caption_hi: input.caption_hi || null,
      })
      .eq('id', mediaId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Replaces the active portfolio-level image for a role (profile/cover/
   * favicon): inserts the new media row for the just-uploaded Cloudinary
   * asset, then soft-deletes whatever was previously active for that role.
   * Insert happens first so a failure never destroys the existing reference.
   * The Cloudinary asset itself is never touched.
   */
  async replacePortfolioRoleMedia(
    portfolioId: string,
    role: PortfolioMediaRole,
    upload: CloudinaryUploadResult,
  ): Promise<Media> {
    const { data: existing, error: existingError } = await supabase
      .from('media')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .is('activity_id', null)
      .eq('role', role)
      .is('deleted_at', null)

    if (existingError) throw existingError

    const payload: MediaInsert = {
      portfolio_id: portfolioId,
      activity_id: null,
      role,
      kind: 'image',
      cloudinary_public_id: upload.publicId,
      cloudinary_secure_url: upload.secureUrl,
      width: upload.width,
      height: upload.height,
      format: upload.format,
      bytes: upload.bytes,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('media')
      .insert(payload)
      .select('*')
      .single()

    if (insertError) throw insertError

    if (existing && existing.length > 0) {
      const { error: deleteError } = await supabase
        .from('media')
        .update({ deleted_at: new Date().toISOString() })
        .in(
          'id',
          existing.map((row) => row.id),
        )

      if (deleteError) throw deleteError
    }

    return inserted
  },

  /** The single active (non-deleted) cover image for an activity. */
  async getActivityCover(
    portfolioId: string,
    activityId: string,
  ): Promise<Media | null> {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('activity_id', activityId)
      .eq('role', 'cover')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Cover thumbnails for a list of activities in one query. Gallery images
   * are intentionally not loaded here.
   */
  async listActivityCovers(
    portfolioId: string,
    activityIds: string[],
  ): Promise<Media[]> {
    if (activityIds.length === 0) return []

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('role', 'cover')
      .is('deleted_at', null)
      .in('activity_id', activityIds)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async listActivityGallery(
    portfolioId: string,
    activityId: string,
    includeDeleted = false,
  ): Promise<Media[]> {
    return mediaService.list(portfolioId, {
      role: 'gallery',
      activityId,
      includeDeleted,
    })
  },

  /**
   * Replaces the active activity cover: insert the new row first, then
   * soft-delete the previous cover. Cloudinary assets are never destroyed.
   */
  async replaceActivityCover(
    portfolioId: string,
    activityId: string,
    upload: CloudinaryUploadResult,
  ): Promise<Media> {
    const { data: existing, error: existingError } = await supabase
      .from('media')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .eq('activity_id', activityId)
      .eq('role', 'cover')
      .is('deleted_at', null)

    if (existingError) throw existingError

    const payload: MediaInsert = {
      portfolio_id: portfolioId,
      activity_id: activityId,
      role: 'cover',
      kind: 'image',
      cloudinary_public_id: upload.publicId,
      cloudinary_secure_url: upload.secureUrl,
      width: upload.width,
      height: upload.height,
      format: upload.format,
      bytes: upload.bytes,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('media')
      .insert(payload)
      .select('*')
      .single()

    if (insertError) throw insertError

    if (existing && existing.length > 0) {
      const { error: deleteError } = await supabase
        .from('media')
        .update({ deleted_at: new Date().toISOString() })
        .in(
          'id',
          existing.map((row) => row.id),
        )

      if (deleteError) throw deleteError
    }

    return inserted
  },

  async addActivityGalleryImage(
    portfolioId: string,
    activityId: string,
    upload: CloudinaryUploadResult,
  ): Promise<Media> {
    const { data: last, error: lastError } = await supabase
      .from('media')
      .select('sort_order')
      .eq('portfolio_id', portfolioId)
      .eq('activity_id', activityId)
      .eq('role', 'gallery')
      .is('deleted_at', null)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastError) throw lastError

    const payload: MediaInsert = {
      portfolio_id: portfolioId,
      activity_id: activityId,
      role: 'gallery',
      kind: 'image',
      cloudinary_public_id: upload.publicId,
      cloudinary_secure_url: upload.secureUrl,
      width: upload.width,
      height: upload.height,
      format: upload.format,
      bytes: upload.bytes,
      sort_order: (last?.sort_order ?? -1) + 1,
    }

    const { data, error } = await supabase
      .from('media')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Persists gallery order as 0-based sort_order. Each update is scoped to
   * this portfolio + activity so a mismatched id cannot reorder another
   * activity's media.
   */
  async reorderActivityGallery(
    portfolioId: string,
    activityId: string,
    orderedIds: string[],
  ): Promise<void> {
    for (let index = 0; index < orderedIds.length; index += 1) {
      const { error } = await supabase
        .from('media')
        .update({ sort_order: index })
        .eq('id', orderedIds[index])
        .eq('portfolio_id', portfolioId)
        .eq('activity_id', activityId)
        .eq('role', 'gallery')

      if (error) throw error
    }
  },
}
