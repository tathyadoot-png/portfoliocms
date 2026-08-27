import { supabase } from '@/shared/lib/supabase'
import type {
  Portfolio,
  PortfolioInsert,
  PortfolioUpdate,
  PortfolioListFilters,
} from '../types'
import type {
  CreatePortfolioValues,
  UpdatePortfolioValues,
} from '../validation/portfolioSchema'

/** All Supabase access for portfolios. Hooks/components never call supabase directly. */
export const portfoliosService = {
  async list(filters: PortfolioListFilters = {}): Promise<Portfolio[]> {
    let query = supabase
      .from('portfolios')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.search) {
      const term = `%${filters.search}%`
      query = query.or(
        `full_name_en.ilike.${term},full_name_hi.ilike.${term},slug.ilike.${term}`,
      )
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(portfolioId: string): Promise<Portfolio | null> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async create(input: CreatePortfolioValues): Promise<Portfolio> {
    const { data: userData } = await supabase.auth.getUser()

    const payload: PortfolioInsert = {
      full_name_en: input.full_name_en,
      full_name_hi: input.full_name_hi,
      slug: input.slug,
      designation_en: input.designation_en || null,
      designation_hi: input.designation_hi || null,
      theme: input.theme,
      created_by: userData.user?.id ?? null,
    }

    const { data, error } = await supabase
      .from('portfolios')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /** Updates the portfolio's own fields (profile screen). Sets updated_by to
   *  the current authenticated user; updated_at is maintained by the DB trigger. */
  async update(
    portfolioId: string,
    input: UpdatePortfolioValues,
  ): Promise<Portfolio> {
    const { data: userData } = await supabase.auth.getUser()

    const payload: PortfolioUpdate = {
      full_name_en: input.full_name_en,
      full_name_hi: input.full_name_hi,
      designation_en: input.designation_en || null,
      designation_hi: input.designation_hi || null,
      about_en: input.about_en || null,
      about_hi: input.about_hi || null,
      slug: input.slug,
      status: input.status,
      theme: input.theme,
      updated_by: userData.user?.id ?? null,
    }

    const { data, error } = await supabase
      .from('portfolios')
      .update(payload)
      .eq('id', portfolioId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },
}
