import { supabase } from '@/shared/lib/supabase'
import type { TablesInsert } from '@/shared/lib/supabase'
import type { CloudinaryConfigRow } from '../types'
import type { CloudinaryConfigValues } from '../validation/cloudinaryConfigSchema'

/** All Supabase access for cloudinary_configs. Portfolio-scoped, 1:1 per portfolio. */
export const cloudinaryConfigService = {
  async getByPortfolio(portfolioId: string): Promise<CloudinaryConfigRow | null> {
    const { data, error } = await supabase
      .from('cloudinary_configs')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /** Creates or updates the portfolio's single Cloudinary config row. */
  async upsert(
    portfolioId: string,
    input: CloudinaryConfigValues,
  ): Promise<CloudinaryConfigRow> {
    const payload: TablesInsert<'cloudinary_configs'> = {
      portfolio_id: portfolioId,
      cloud_name: input.cloud_name,
      upload_preset: input.upload_preset,
      default_folder: input.default_folder || null,
    }

    const { data, error } = await supabase
      .from('cloudinary_configs')
      .upsert(payload, { onConflict: 'portfolio_id' })
      .select('*')
      .single()

    if (error) throw error
    return data
  },
}
