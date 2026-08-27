import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/layout'
import { ROUTES } from '@/shared/constants'
import { useActivePortfolio } from '@/features/portfolios'
import { useCloudinaryConfigQuery } from '@/features/cloudinary-settings'
import { ActivityForm } from '../components/ActivityForm'
import { useCreateActivityMutation } from '../hooks/useCreateActivityMutation'
import { toFormValues, toWriteInput } from '../utils/form'
import { getFriendlyActivityError } from '../utils/errors'
import type { ActivityFormValues } from '../validation/activitySchema'

export function ActivityCreatePage() {
  const portfolio = useActivePortfolio()
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateActivityMutation(portfolio.id)
  const { data: cloudinaryConfigRow } = useCloudinaryConfigQuery(portfolio.id)

  const cloudinaryConfig = cloudinaryConfigRow
    ? {
        cloudName: cloudinaryConfigRow.cloud_name,
        uploadPreset: cloudinaryConfigRow.upload_preset,
        defaultFolder: cloudinaryConfigRow.default_folder,
      }
    : null

  const handleSubmit = async (values: ActivityFormValues) => {
    try {
      const activity = await mutateAsync(toWriteInput(values))
      toast.success('Activity created')
      navigate(ROUTES.portfolios.activity(portfolio.id, activity.id), {
        state: { created: true },
      })
    } catch (error) {
      toast.error(getFriendlyActivityError(error))
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={ROUTES.portfolios.activities(portfolio.id)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to activities
      </Link>

      <PageHeader
        title="New activity"
        description="Drafts can be incomplete. Publishing requires English and Hindi titles and descriptions plus an activity date."
      />

      <ActivityForm
        portfolioId={portfolio.id}
        defaultValues={toFormValues()}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create activity"
        cloudinaryConfig={cloudinaryConfig}
      />
    </div>
  )
}
