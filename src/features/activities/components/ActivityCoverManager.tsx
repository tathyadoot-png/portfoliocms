import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ImageUploader } from '@/shared/components/media'
import { LoadingState } from '@/shared/components/feedback'
import { ROUTES } from '@/shared/constants'
import { getErrorMessage } from '@/shared/utils'
import {
  MEDIA_ACCEPTED_IMAGE_TYPES,
  MEDIA_MAX_IMAGE_SIZE_BYTES,
  useActivityCoverQuery,
  useReplaceActivityCoverMutation,
  useSoftDeleteMediaMutation,
} from '@/features/media'

export interface ActivityCoverManagerProps {
  portfolioId: string
  activityId: string
  cloudinaryConfig: {
    cloudName: string
    uploadPreset: string
    defaultFolder?: string | null
  } | null
}

export function ActivityCoverManager({
  portfolioId,
  activityId,
  cloudinaryConfig,
}: ActivityCoverManagerProps) {
  const { data: media, isLoading } = useActivityCoverQuery(
    portfolioId,
    activityId,
  )
  const replaceMutation = useReplaceActivityCoverMutation(
    portfolioId,
    activityId,
  )
  const deleteMutation = useSoftDeleteMediaMutation(portfolioId)

  if (!cloudinaryConfig) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Configure Cloudinary before uploading a cover.{' '}
        <Link
          to={ROUTES.portfolios.cloudinarySettings(portfolioId)}
          className="font-medium text-primary underline underline-offset-2"
        >
          Go to Cloudinary settings
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingState message="Loading cover…" />
  }

  return (
    <ImageUploader
      cloudName={cloudinaryConfig.cloudName}
      uploadPreset={cloudinaryConfig.uploadPreset}
      folder={[cloudinaryConfig.defaultFolder, 'activities', activityId, 'cover']
        .filter((segment): segment is string => Boolean(segment))
        .join('/')}
      currentImageUrl={media?.cloudinary_secure_url}
      alt={media?.alt_text_en ?? 'Activity cover'}
      accept={MEDIA_ACCEPTED_IMAGE_TYPES}
      maxSizeBytes={MEDIA_MAX_IMAGE_SIZE_BYTES}
      aspectClassName="aspect-video max-w-sm"
      onUploadSuccess={async (result) => {
        await replaceMutation.mutateAsync(result)
        toast.success('Cover updated')
      }}
      onUploadError={(error) => toast.error(getErrorMessage(error))}
      onRemove={
        media
          ? async () => {
              await deleteMutation.mutateAsync(media.id)
              toast.success('Cover removed')
            }
          : undefined
      }
    />
  )
}
