import { useState } from 'react'
import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { CloudinaryImage } from '@/shared/components/media'
import { Button, Card, CardContent } from '@/shared/components/ui'
import { Spinner } from '@/shared/components/ui'
import { getErrorMessage } from '@/shared/utils'
import { useUpdateMediaMetadataMutation } from '../hooks/useUpdateMediaMetadataMutation'
import { useSoftDeleteMediaMutation } from '../hooks/useSoftDeleteMediaMutation'
import { useRestoreMediaMutation } from '../hooks/useRestoreMediaMutation'
import { MediaMetadataForm } from './MediaMetadataForm'
import type { Media } from '../types'
import type { MediaMetadataValues } from '../validation/mediaMetadataSchema'

export interface MediaCardProps {
  portfolioId: string
  media: Media
}

export function MediaCard({ portfolioId, media }: MediaCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const updateMetadata = useUpdateMediaMetadataMutation(portfolioId)
  const softDelete = useSoftDeleteMediaMutation(portfolioId)
  const restore = useRestoreMediaMutation(portfolioId)

  const isDeleted = Boolean(media.deleted_at)

  const handleSaveMetadata = async (values: MediaMetadataValues) => {
    try {
      await updateMetadata.mutateAsync({ mediaId: media.id, metadata: values })
      toast.success('Media details updated')
      setIsEditing(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    try {
      await softDelete.mutateAsync(media.id)
      toast.success('Media removed')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleRestore = async () => {
    try {
      await restore.mutateAsync(media.id)
      toast.success('Media restored')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Card className={isDeleted ? 'opacity-60' : undefined}>
      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
        <CloudinaryImage
          secureUrl={media.cloudinary_secure_url}
          alt={media.alt_text_en ?? ''}
          className="h-full w-full"
        />
      </div>
      <CardContent className="flex flex-col gap-2 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            {media.role}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {media.kind}
          </span>
          {media.activity_id ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              activity
            </span>
          ) : null}
          {isDeleted ? (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              deleted
            </span>
          ) : null}
        </div>

        {isEditing ? (
          <MediaMetadataForm
            media={media}
            onSubmit={handleSaveMetadata}
            onCancel={() => setIsEditing(false)}
            isSubmitting={updateMetadata.isPending}
          />
        ) : (
          <>
            <p className="truncate text-xs text-muted-foreground">
              {media.alt_text_en || media.caption_en || 'No description yet'}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit details
              </Button>
              {isDeleted ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={restore.isPending}
                  onClick={() => void handleRestore()}
                >
                  {restore.isPending ? <Spinner /> : <RotateCcw className="h-3.5 w-3.5" />}
                  Restore
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={softDelete.isPending}
                  onClick={() => void handleDelete()}
                >
                  {softDelete.isPending ? <Spinner /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
