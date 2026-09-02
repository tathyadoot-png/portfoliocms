import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/layout'
import {
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  buttonVariants,
} from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { useActivePortfolio } from '@/features/portfolios'
import { useCloudinaryConfigQuery } from '@/features/cloudinary-settings'
import { ActivityForm } from '../components/ActivityForm'
import { useActivityQuery } from '../hooks/useActivityQuery'
import { useUpdateActivityMutation } from '../hooks/useUpdateActivityMutation'
import { toFormValues, toWriteInput } from '../utils/form'
import { getFriendlyActivityError } from '../utils/errors'
import { formatDate, formatDateTime } from '../utils/datetime'
import type { ActivityFormValues } from '../validation/activitySchema'

export function ActivityEditPage() {
  const portfolio = useActivePortfolio()
  const { activityId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const justCreated = Boolean(
    (location.state as { created?: boolean } | null)?.created,
  )

  const { data, isLoading, isError, error, refetch } = useActivityQuery(
    portfolio.id,
    activityId,
  )
  const { mutateAsync, isPending } = useUpdateActivityMutation(
    portfolio.id,
    activityId,
  )
  const { data: cloudinaryConfigRow } = useCloudinaryConfigQuery(portfolio.id)

  const cloudinaryConfig = cloudinaryConfigRow
    ? {
        cloudName: cloudinaryConfigRow.cloud_name,
        uploadPreset: cloudinaryConfigRow.upload_preset,
        defaultFolder: cloudinaryConfigRow.default_folder,
      }
    : null

  const handleSubmit = async (values: ActivityFormValues) => {
    if (!data) return
    try {
      await mutateAsync(
        toWriteInput(values, data.slug, {
          existingActivityDate: data.activity_date,
        }),
      )
      toast.success('Activity saved')
    } catch (error) {
      toast.error(getFriendlyActivityError(error))
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading activity…" />
  }

  if (isError) {
    return (
      <ErrorState
        message={getFriendlyActivityError(error)}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data) {
    return (
      <ErrorState
        title="Activity not found"
        message="This activity does not exist in the current portfolio."
        onRetry={() => navigate(ROUTES.portfolios.activities(portfolio.id))}
      />
    )
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl">
      <Link
        to={ROUTES.portfolios.activities(portfolio.id)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to activities
      </Link>

      <PageHeader
        title={data.title_en || 'Edit activity'}
        description={data.title_hi || undefined}
      />

      {justCreated ? (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-accent/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">
            Activity created. You can view it, keep editing, or create another.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to={ROUTES.portfolios.activity(portfolio.id, data.id)}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              View activity
            </Link>
            <Button type="button" size="sm" variant="outline" disabled>
              Edit activity
            </Button>
            <Link
              to={ROUTES.portfolios.activityNew(portfolio.id)}
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              Create another activity
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="capitalize">{data.status}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Featured</dt>
                <dd>{data.is_featured ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Activity date</dt>
                <dd>{formatDate(data.activity_date)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd>{formatDateTime(data.created_at)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{formatDateTime(data.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created by</dt>
                <dd className="break-all">{data.created_by ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated by</dt>
                <dd className="break-all">{data.updated_by ?? '—'}</dd>
              </div>
              {data.deleted_at ? (
                <div>
                  <dt className="text-muted-foreground">Deleted at</dt>
                  <dd>{formatDateTime(data.deleted_at)}</dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      </div>

      <ActivityForm
        key={data.id}
        portfolioId={portfolio.id}
        activityId={data.id}
        defaultValues={toFormValues(data)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Save activity"
        cloudinaryConfig={cloudinaryConfig}
      />
    </div>
  )
}
