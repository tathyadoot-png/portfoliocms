import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { CloudinaryImage } from '@/shared/components/media'
import { ConfirmDialog } from '@/shared/components/feedback'
import {
  Button,
  Card,
  CardContent,
  Input,
  buttonVariants,
} from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { getFriendlyActivityError } from '../utils/errors'
import {
  formatDate,
  formatDateTime,
  fromDatetimeLocal,
  toDatetimeLocal,
} from '../utils/datetime'
import { getMissingPublishFields } from '../validation/activitySchema'
import { useArchiveActivityMutation } from '../hooks/useArchiveActivityMutation'
import { usePublishActivityMutation } from '../hooks/usePublishActivityMutation'
import { useRestoreActivityMutation } from '../hooks/useRestoreActivityMutation'
import { useScheduleActivityMutation } from '../hooks/useScheduleActivityMutation'
import { useSoftDeleteActivityMutation } from '../hooks/useSoftDeleteActivityMutation'
import { ActivityStatusBadge } from './ActivityStatusBadge'
import type { Activity } from '../types'
import type { Media } from '@/features/media'

type DialogKind = 'delete' | 'archive' | 'publish' | 'schedule' | 'restore' | null

export interface ActivityCardProps {
  portfolioId: string
  activity: Activity
  cover: Media | null
}

export function ActivityCard({
  portfolioId,
  activity,
  cover,
}: ActivityCardProps) {
  const [dialog, setDialog] = useState<DialogKind>(null)
  const [scheduleAt, setScheduleAt] = useState(activity.publish_at ?? '')

  const publishMutation = usePublishActivityMutation(portfolioId)
  const scheduleMutation = useScheduleActivityMutation(portfolioId)
  const archiveMutation = useArchiveActivityMutation(portfolioId)
  const deleteMutation = useSoftDeleteActivityMutation(portfolioId)
  const restoreMutation = useRestoreActivityMutation(portfolioId)

  const isDeleted = Boolean(activity.deleted_at)
  const missing = getMissingPublishFields(activity)
  const isPending =
    publishMutation.isPending ||
    scheduleMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending

  const close = () => setDialog(null)

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      toast.success(success)
      close()
    } catch (error) {
      toast.error(getFriendlyActivityError(error))
    }
  }

  return (
    <Card className={isDeleted ? 'opacity-70' : undefined}>
      <div className="flex flex-col sm:flex-row">
        <div className="aspect-video w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:h-auto sm:w-48">
          {cover ? (
            <CloudinaryImage
              secureUrl={cover.cloudinary_secure_url}
              alt={cover.alt_text_en ?? activity.title_en}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full min-h-24 items-center justify-center text-xs text-muted-foreground">
              No cover
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-4 sm:pt-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold text-foreground">
                {activity.title_en}
              </h2>
              <p className="text-sm text-muted-foreground">{activity.title_hi}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <ActivityStatusBadge status={activity.status} />
              {activity.is_featured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  <Star className="h-3 w-3" />
                  Featured
                </span>
              ) : null}
              {isDeleted ? (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  Deleted
                </span>
              ) : null}
            </div>
          </div>

          <dl className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="font-medium text-foreground">Activity date</dt>
              <dd>{formatDate(activity.activity_date)}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Display date</dt>
              <dd>{activity.display_date || '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Location</dt>
              <dd>{activity.location_en || activity.location_hi || '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Updated</dt>
              <dd>{formatDateTime(activity.updated_at)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Link
              to={ROUTES.portfolios.activity(portfolioId, activity.id)}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              View / Edit
            </Link>

            {isDeleted ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setDialog('restore')}
              >
                Restore
              </Button>
            ) : (
              <>
                {activity.status !== 'published' ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setDialog('publish')}
                  >
                    Publish
                  </Button>
                ) : null}
                {activity.status !== 'scheduled' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => {
                      setScheduleAt(toDatetimeLocal(activity.publish_at))
                      setDialog('schedule')
                    }}
                  >
                    Schedule
                  </Button>
                ) : null}
                {activity.status !== 'archived' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setDialog('archive')}
                  >
                    Archive
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setDialog('delete')}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </div>

      <ConfirmDialog
        open={dialog === 'delete'}
        title="Delete this activity?"
        description="The activity will be hidden from the default list. It is not permanently deleted and can be restored."
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deleteMutation.isPending}
        onCancel={close}
        onConfirm={() =>
          void run(
            () => deleteMutation.mutateAsync(activity.id),
            'Activity deleted',
          )
        }
      />

      <ConfirmDialog
        open={dialog === 'archive'}
        title="Archive this activity?"
        description="Archived activities stay in this portfolio and can be edited later."
        confirmLabel="Archive"
        isConfirming={archiveMutation.isPending}
        onCancel={close}
        onConfirm={() =>
          void run(
            () => archiveMutation.mutateAsync(activity.id),
            'Activity archived',
          )
        }
      />

      <ConfirmDialog
        open={dialog === 'restore'}
        title="Restore this activity?"
        confirmLabel="Restore"
        isConfirming={restoreMutation.isPending}
        onCancel={close}
        onConfirm={() =>
          void run(
            () => restoreMutation.mutateAsync(activity.id),
            'Activity restored',
          )
        }
      />

      <ConfirmDialog
        open={dialog === 'publish'}
        title="Publish this activity?"
        description={
          missing.length > 0
            ? `Cannot publish until these fields are filled: ${missing.join(', ')}.`
            : 'The activity will be marked published. There is no automatic browser-side publishing job.'
        }
        confirmLabel="Publish"
        isConfirming={publishMutation.isPending}
        onCancel={close}
        onConfirm={() => {
          if (missing.length > 0) {
            toast.error(
              `Cannot publish until these fields are filled: ${missing.join(', ')}`,
            )
            return
          }
          void run(
            () => publishMutation.mutateAsync(activity.id),
            'Activity published',
          )
        }}
      />

      <ConfirmDialog
        open={dialog === 'schedule'}
        title="Schedule this activity?"
        description={
          missing.length > 0
            ? `Cannot schedule until these fields are filled: ${missing.join(', ')}.`
            : 'Set the publish time. The CMS will not auto-publish; a future job may use this timestamp.'
        }
        confirmLabel="Schedule"
        isConfirming={scheduleMutation.isPending}
        onCancel={close}
        onConfirm={() => {
          if (missing.length > 0) {
            toast.error(
              `Cannot schedule until these fields are filled: ${missing.join(', ')}`,
            )
            return
          }
          const iso = fromDatetimeLocal(scheduleAt)
          if (!iso) {
            toast.error('Publish time is required to schedule.')
            return
          }
          void run(
            () =>
              scheduleMutation.mutateAsync({
                activityId: activity.id,
                publishAt: iso,
              }),
            'Activity scheduled',
          )
        }}
      >
        {missing.length === 0 ? (
          <Input
            type="datetime-local"
            value={scheduleAt}
            onChange={(event) => setScheduleAt(event.target.value)}
            aria-label="Publish at"
          />
        ) : null}
      </ConfirmDialog>

    </Card>
  )
}
