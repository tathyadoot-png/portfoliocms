import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Plus } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback'
import { Input, buttonVariants } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import { useDebounce } from '@/shared/hooks'
import { cn, getErrorMessage } from '@/shared/utils'
import { useActivePortfolio } from '@/features/portfolios'
import { useActivityCoversQuery, type Media } from '@/features/media'
import { ACTIVITY_STATUSES } from '../constants'
import { useActivitiesQuery } from '../hooks/useActivitiesQuery'
import { ActivityCard } from '../components/ActivityCard'
import type { ActivityListFilters, ActivityStatus } from '../types'

export function ActivitiesPage() {
  const portfolio = useActivePortfolio()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ActivityStatus | 'all'>('all')
  const [featured, setFeatured] = useState<'all' | 'yes' | 'no'>('all')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const debouncedSearch = useDebounce(search, 300)

  const filters: ActivityListFilters = {
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    isFeatured: featured === 'all' ? undefined : featured === 'yes',
    includeDeleted: includeDeleted || undefined,
    activityDateFrom: dateFrom || undefined,
    activityDateTo: dateTo || undefined,
  }

  const { data, isLoading, isError, error, refetch } = useActivitiesQuery(
    portfolio.id,
    filters,
  )

  const activityIds = useMemo(() => data?.map((item) => item.id) ?? [], [data])
  const { data: covers } = useActivityCoversQuery(portfolio.id, activityIds)

  const coverByActivityId = useMemo(() => {
    const map = new Map<string, Media>()
    for (const cover of covers ?? []) {
      if (cover.activity_id && !map.has(cover.activity_id)) {
        map.set(cover.activity_id, cover)
      }
    }
    return map
  }, [covers])

  return (
    <div>
      <PageHeader
        title="Activities"
        description={`Activities for ${portfolio.full_name_en}. Sorted by activity date, newest first.`}
        actions={
          <Link
            to={ROUTES.portfolios.activityNew(portfolio.id)}
            className={cn(buttonVariants())}
          >
            <Plus className="h-4 w-4" />
            New activity
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search title, slug, or location…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search activities"
          />
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ActivityStatus | 'all')
            }
            className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All statuses</option>
            {ACTIVITY_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by featured"
            value={featured}
            onChange={(event) =>
              setFeatured(event.target.value as 'all' | 'yes' | 'no')
            }
            className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Featured: all</option>
            <option value="yes">Featured only</option>
            <option value="no">Not featured</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(event) => setIncludeDeleted(event.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Show deleted
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-md">
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="Activity date from"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="Activity date to"
          />
        </div>
      </div>

      {isLoading ? <LoadingState /> : null}

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : null}

      {!isLoading && !isError && data && data.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" />}
          title="No activities yet"
          description="Create a draft, add English and Hindi content, then publish when it is ready."
          action={
            <Link
              to={ROUTES.portfolios.activityNew(portfolio.id)}
              className={cn(buttonVariants())}
            >
              Create activity
            </Link>
          }
        />
      ) : null}

      {!isError && data && data.length > 0 ? (
        <div className="flex flex-col gap-4">
          {data.map((activity) => (
            <ActivityCard
              key={activity.id}
              portfolioId={portfolio.id}
              activity={activity}
              cover={coverByActivityId.get(activity.id) ?? null}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
