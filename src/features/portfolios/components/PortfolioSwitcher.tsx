import { useNavigate, useParams } from 'react-router-dom'
import { ChevronsUpDown } from 'lucide-react'
import { ROUTES } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { usePortfoliosQuery } from '../hooks/usePortfoliosQuery'

/**
 * Connected portfolio switcher. Rendered by DashboardLayout. Switching
 * navigates to the selected portfolio's URL — the URL stays the source of
 * truth for the active portfolio.
 */
export function PortfolioSwitcher() {
  const { data: portfolios, isLoading } = usePortfoliosQuery()
  const { portfolioId } = useParams<{ portfolioId: string }>()
  const navigate = useNavigate()

  return (
    <div className="relative">
      <select
        aria-label="Switch portfolio"
        value={portfolioId ?? ''}
        disabled={isLoading}
        onChange={(event) => {
          const id = event.target.value
          if (id) navigate(ROUTES.portfolios.detail(id))
        }}
        className={cn(
          'h-9 w-56 appearance-none rounded-md border border-input bg-card pl-3 pr-8 text-sm shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
        )}
      >
        <option value="" disabled>
          {isLoading ? 'Loading…' : 'Select portfolio'}
        </option>
        {portfolios?.map((portfolio) => (
          <option key={portfolio.id} value={portfolio.id}>
            {portfolio.full_name_en}
          </option>
        ))}
      </select>
      <ChevronsUpDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
