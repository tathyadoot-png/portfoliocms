import { supabase } from '@/shared/lib/supabase'
import type {
  SocialLink,
  SocialLinkInsert,
  SocialLinkUpdate,
  SocialLinkWriteInput,
} from '../types'

/**
 * All Supabase access for `social_links`. Every function takes an explicit
 * portfolioId — queries are never global and then filtered in React.
 */
export const socialLinksService = {
  async list(portfolioId: string): Promise<SocialLink[]> {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async getById(portfolioId: string, id: string): Promise<SocialLink | null> {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async create(
    portfolioId: string,
    input: SocialLinkWriteInput,
  ): Promise<SocialLink> {
    const { data: last, error: lastError } = await supabase
      .from('social_links')
      .select('sort_order')
      .eq('portfolio_id', portfolioId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastError) throw lastError

    const payload: SocialLinkInsert = {
      portfolio_id: portfolioId,
      platform: input.platform,
      url: input.url,
      custom_label:
        input.platform === 'other' ? input.custom_label : null,
      is_visible: input.is_visible,
      sort_order: (last?.sort_order ?? -1) + 1,
    }

    const { data, error } = await supabase
      .from('social_links')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async update(
    portfolioId: string,
    id: string,
    input: SocialLinkWriteInput,
  ): Promise<SocialLink> {
    const payload: SocialLinkUpdate = {
      platform: input.platform,
      url: input.url,
      custom_label:
        input.platform === 'other' ? input.custom_label : null,
      is_visible: input.is_visible,
    }

    const { data, error } = await supabase
      .from('social_links')
      .update(payload)
      .eq('portfolio_id', portfolioId)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async remove(portfolioId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('portfolio_id', portfolioId)
      .eq('id', id)

    if (error) throw error
  },

  async setVisibility(
    portfolioId: string,
    id: string,
    isVisible: boolean,
  ): Promise<SocialLink> {
    const { data, error } = await supabase
      .from('social_links')
      .update({ is_visible: isVisible })
      .eq('portfolio_id', portfolioId)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Persists 0-based sort_order. Each update is scoped to this portfolio so a
   * mismatched id cannot reorder another portfolio's links.
   */
  async reorder(portfolioId: string, orderedIds: string[]): Promise<void> {
    for (let index = 0; index < orderedIds.length; index += 1) {
      const { error } = await supabase
        .from('social_links')
        .update({ sort_order: index })
        .eq('id', orderedIds[index])
        .eq('portfolio_id', portfolioId)

      if (error) throw error
    }
  },
}
