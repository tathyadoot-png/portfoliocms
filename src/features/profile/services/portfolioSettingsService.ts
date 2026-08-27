import { supabase } from '@/shared/lib/supabase'
import type { TablesInsert } from '@/shared/lib/supabase'
import type { PortfolioSettingsRow } from '../types'
import type { PortfolioSettingsValues } from '../validation/portfolioSettingsSchema'

/** All Supabase access for portfolio_settings. Portfolio-scoped, 1:1, optional row. */
export const portfolioSettingsService = {
  async getByPortfolio(portfolioId: string): Promise<PortfolioSettingsRow | null> {
    const { data, error } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /** Creates the row on first save, updates it thereafter. */
  async upsert(
    portfolioId: string,
    input: PortfolioSettingsValues,
  ): Promise<PortfolioSettingsRow> {
    const payload: TablesInsert<'portfolio_settings'> = {
      portfolio_id: portfolioId,
      contact_email: input.contact_email || null,
      contact_phone: input.contact_phone || null,
      address_en: input.address_en || null,
      address_hi: input.address_hi || null,
      google_map_url: input.google_map_url || null,
      copyright_text_en: input.copyright_text_en || null,
      copyright_text_hi: input.copyright_text_hi || null,
    }

    const { data, error } = await supabase
      .from('portfolio_settings')
      .upsert(payload, { onConflict: 'portfolio_id' })
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /** Persists which media row is the active favicon (never the URL directly). */
  async setFaviconMediaId(
    portfolioId: string,
    faviconMediaId: string | null,
  ): Promise<PortfolioSettingsRow> {
    const payload: TablesInsert<'portfolio_settings'> = {
      portfolio_id: portfolioId,
      favicon_media_id: faviconMediaId,
    }

    const { data, error } = await supabase
      .from('portfolio_settings')
      .upsert(payload, { onConflict: 'portfolio_id' })
      .select('*')
      .single()

    if (error) throw error
    return data
  },
}
