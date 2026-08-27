import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/shared/lib/supabase'

// Domain types are derived from the generated Database type — never hand-written.
export type Portfolio = Tables<'portfolios'>
export type PortfolioInsert = TablesInsert<'portfolios'>
export type PortfolioUpdate = TablesUpdate<'portfolios'>
export type PortfolioStatus = Enums<'portfolio_status'>

export interface PortfolioListFilters {
  search?: string
  status?: PortfolioStatus
}
