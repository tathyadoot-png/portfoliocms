import { cn } from '@/shared/utils'
import type { ActivityStatus } from '../types'

const STYLES: Record<ActivityStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-amber-100 text-amber-800',
  published: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-slate-200 text-slate-700',
}

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        STYLES[status],
      )}
    >
      {status}
    </span>
  )
}
