import { useState } from 'react'
import { Images } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback'
import { getErrorMessage } from '@/shared/utils'
import { useActivePortfolio } from '@/features/portfolios'
import { useMediaListQuery } from '../hooks/useMediaListQuery'
import { MediaCard } from '../components/MediaCard'
import type { MediaRole } from '../types'

const ROLE_FILTERS: Array<{ label: string; value: MediaRole | 'all' }> = [
  { label: 'All roles', value: 'all' },
  { label: 'Profile', value: 'profile' },
  { label: 'Cover', value: 'cover' },
  { label: 'Favicon', value: 'favicon' },
  { label: 'Gallery', value: 'gallery' },
]

export function MediaPage() {
  const portfolio = useActivePortfolio()
  const [role, setRole] = useState<MediaRole | 'all'>('all')
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const { data, isLoading, isError, error, refetch } = useMediaListQuery(
    portfolio.id,
    {
      role: role === 'all' ? undefined : role,
      includeDeleted,
    },
  )

  return (
    <div>
      <PageHeader
        title="Media"
        description={`Cloudinary-backed media library for ${portfolio.full_name_en}.`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          aria-label="Filter by role"
          value={role}
          onChange={(event) => setRole(event.target.value as MediaRole | 'all')}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ROLE_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
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

      {isLoading ? <LoadingState /> : null}

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : null}

      {!isLoading && !isError && data && data.length === 0 ? (
        <EmptyState
          icon={<Images className="h-8 w-8" />}
          title="No media yet"
          description="Upload a profile image, cover image, or favicon from the Profile and Settings pages."
        />
      ) : null}

      {!isError && data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <MediaCard key={item.id} portfolioId={portfolio.id} media={item} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
