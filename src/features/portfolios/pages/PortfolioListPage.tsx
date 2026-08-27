import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderOpen } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout'
import { Input, buttonVariants } from '@/shared/components/ui'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback'
import { ROUTES } from '@/shared/constants'
import { useDebounce } from '@/shared/hooks'
import { cn, getErrorMessage } from '@/shared/utils'
import { usePortfoliosQuery } from '../hooks/usePortfoliosQuery'
import { PortfolioCard } from '../components/PortfolioCard'

export function PortfolioListPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data, isLoading, isError, error, refetch } = usePortfoliosQuery({
    search: debouncedSearch || undefined,
  })

  return (
    <div>
      <PageHeader
        title="Portfolios"
        description="Select a portfolio to manage, or create a new one."
        actions={
          <Link to={ROUTES.portfolios.new} className={cn(buttonVariants())}>
            <Plus className="h-4 w-4" />
            New portfolio
          </Link>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search portfolios…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {isLoading ? <LoadingState /> : null}

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : null}

      {!isLoading && !isError && data && data.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-8 w-8" />}
          title="No portfolios yet"
          description="Create your first portfolio to get started."
          action={
            <Link to={ROUTES.portfolios.new} className={cn(buttonVariants())}>
              Create portfolio
            </Link>
          }
        />
      ) : null}

      {!isError && data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
