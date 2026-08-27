import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ImageUploader } from '@/shared/components/media'
import { LoadingState } from '@/shared/components/feedback'
import { ROUTES } from '@/shared/constants'
import { getErrorMessage } from '@/shared/utils'
import {
  MEDIA_ACCEPTED_IMAGE_TYPES,
  MEDIA_MAX_IMAGE_SIZE_BYTES,
} from '../constants'
import { usePortfolioRoleMediaQuery } from '../hooks/usePortfolioRoleMediaQuery'
import { useReplacePortfolioRoleMediaMutation } from '../hooks/useReplacePortfolioRoleMediaMutation'
import { useSoftDeleteMediaMutation } from '../hooks/useSoftDeleteMediaMutation'
import type { Media, PortfolioMediaRole } from '../types'

export interface RoleImageManagerProps {
  portfolioId: string
  role: PortfolioMediaRole
  cloudinaryConfig: {
    cloudName: string
    uploadPreset: string
    defaultFolder?: string | null
  } | null
  label: string
  helpText?: string
  aspectClassName?: string
  /** Notified after a successful replace or removal — used by the favicon
   *  flow to keep `portfolio_settings.favicon_media_id` in sync. */
  onChange?: (media: Media | null) => void
}

/**
 * Connected manager for a single portfolio-level image role (profile, cover,
 * or favicon). Owns the "load current image -> upload -> create media row ->
 * soft-delete previous row" flow so it isn't duplicated across the profile
 * and settings screens.
 */
export function RoleImageManager({
  portfolioId,
  role,
  cloudinaryConfig,
  label,
  helpText,
  aspectClassName,
  onChange,
}: RoleImageManagerProps) {
  const { data: media, isLoading } = usePortfolioRoleMediaQuery(
    portfolioId,
    role,
  )
  const replaceMutation = useReplacePortfolioRoleMediaMutation(portfolioId, role)
  const deleteMutation = useSoftDeleteMediaMutation(portfolioId)

  if (!cloudinaryConfig) {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Configure Cloudinary before uploading images.{' '}
          <Link
            to={ROUTES.portfolios.cloudinarySettings(portfolioId)}
            className="font-medium text-primary underline underline-offset-2"
          >
            Go to Cloudinary settings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      {helpText ? (
        <p className="mb-2 text-xs text-muted-foreground">{helpText}</p>
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading current image…" />
      ) : (
        <ImageUploader
          cloudName={cloudinaryConfig.cloudName}
          uploadPreset={cloudinaryConfig.uploadPreset}
          folder={[cloudinaryConfig.defaultFolder, role]
            .filter((segment): segment is string => Boolean(segment))
            .join('/')}
          currentImageUrl={media?.cloudinary_secure_url}
          alt={media?.alt_text_en ?? label}
          accept={MEDIA_ACCEPTED_IMAGE_TYPES}
          maxSizeBytes={MEDIA_MAX_IMAGE_SIZE_BYTES}
          aspectClassName={aspectClassName}
          onUploadSuccess={async (result) => {
            const updated = await replaceMutation.mutateAsync(result)
            toast.success(`${label} updated`)
            onChange?.(updated)
          }}
          onUploadError={(error) => toast.error(getErrorMessage(error))}
          onRemove={
            media
              ? async () => {
                  await deleteMutation.mutateAsync(media.id)
                  toast.success(`${label} removed`)
                  onChange?.(null)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
