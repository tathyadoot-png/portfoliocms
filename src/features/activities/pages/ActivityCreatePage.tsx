import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/layout'
import { ROUTES } from '@/shared/constants'
import { useActivePortfolio } from '@/features/portfolios'
import { useCloudinaryConfigQuery } from '@/features/cloudinary-settings'
import { ActivityForm } from '../components/ActivityForm'
import { useQueryClient } from '@tanstack/react-query'
import { mediaKeys } from '@/features/media'
import { useCreateActivityMutation } from '../hooks/useCreateActivityMutation'
import { toFormValues, toWriteInput } from '../utils/form'
import { attachPendingActivityMedia } from '../utils/attachPendingMedia'
import { getFriendlyActivityError } from '../utils/errors'
import type { ActivityFormValues } from '../validation/activitySchema'
import type { PendingActivityMediaValue } from '../components/PendingActivityMedia'

export function ActivityCreatePage() {
  const portfolio = useActivePortfolio()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [attachingMedia, setAttachingMedia] = useState(false)
  const { mutateAsync, isPending } = useCreateActivityMutation(portfolio.id)
  const { data: cloudinaryConfigRow } = useCloudinaryConfigQuery(portfolio.id)

  const cloudinaryConfig = cloudinaryConfigRow
    ? {
        cloudName: cloudinaryConfigRow.cloud_name,
        uploadPreset: cloudinaryConfigRow.upload_preset,
        defaultFolder: cloudinaryConfigRow.default_folder,
      }
    : null

  const handleSubmit = async (
    values: ActivityFormValues,
    pendingMedia?: PendingActivityMediaValue,
  ) => {
    let activityId: string | null = null
    try {
      const activity = await mutateAsync(
        toWriteInput(values, '', { isCreate: true }),
      )
      activityId = activity.id

      const hasPendingMedia = Boolean(
        pendingMedia?.cover || (pendingMedia?.gallery.length ?? 0) > 0,
      )

      if (hasPendingMedia && cloudinaryConfig) {
        setAttachingMedia(true)
        await attachPendingActivityMedia(
          portfolio.id,
          activity.id,
          cloudinaryConfig,
          pendingMedia ?? { cover: null, gallery: [] },
        )
        await queryClient.invalidateQueries({
          queryKey: mediaKeys.all(portfolio.id),
        })
        setAttachingMedia(false)
      } else if (hasPendingMedia && !cloudinaryConfig) {
        toast.error(
          'Activity was created, but the image upload failed. Please retry the media upload.',
        )
        navigate(ROUTES.portfolios.activity(portfolio.id, activity.id), {
          state: { created: true },
        })
        return
      }

      toast.success('Activity created')
      navigate(ROUTES.portfolios.activity(portfolio.id, activity.id), {
        state: { created: true },
      })
    } catch (error) {
      setAttachingMedia(false)
      if (activityId) {
        console.error('Activity media upload failed:', error)
        toast.error(
          'Activity was created, but the image upload failed. Please retry the media upload.',
        )
        navigate(ROUTES.portfolios.activity(portfolio.id, activityId), {
          state: { created: true },
        })
        return
      }
      console.error('Activity could not be created:', error)
      toast.error(getFriendlyActivityError(error))
    }
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
        title="New activity"
        description="New activities default to Published and Featured. English and Hindi titles and descriptions plus an activity date are required to publish."
      />

      <ActivityForm
        portfolioId={portfolio.id}
        defaultValues={toFormValues()}
        onSubmit={handleSubmit}
        isSubmitting={isPending || attachingMedia}
        submitLabel="Create activity"
        cloudinaryConfig={cloudinaryConfig}
      />
    </div>
  )
}
