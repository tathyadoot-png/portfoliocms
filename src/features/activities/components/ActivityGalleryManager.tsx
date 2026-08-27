import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, RotateCcw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { CloudinaryImage, ImageUploader } from '@/shared/components/media'
import { LoadingState } from '@/shared/components/feedback'
import { Button, Card, CardContent, Spinner } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import { getErrorMessage } from '@/shared/utils'
import {
  MEDIA_ACCEPTED_IMAGE_TYPES,
  MEDIA_MAX_IMAGE_SIZE_BYTES,
  MediaMetadataForm,
  useActivityGalleryQuery,
  useAddActivityGalleryImageMutation,
  useReorderActivityGalleryMutation,
  useRestoreMediaMutation,
  useSoftDeleteMediaMutation,
  useUpdateMediaMetadataMutation,
  type Media,
  type MediaMetadataValues,
} from '@/features/media'

export interface ActivityGalleryManagerProps {
  portfolioId: string
  activityId: string
  cloudinaryConfig: {
    cloudName: string
    uploadPreset: string
    defaultFolder?: string | null
  } | null
}

export function ActivityGalleryManager({
  portfolioId,
  activityId,
  cloudinaryConfig,
}: ActivityGalleryManagerProps) {
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useActivityGalleryQuery(
    portfolioId,
    activityId,
    includeDeleted,
  )
  const addMutation = useAddActivityGalleryImageMutation(portfolioId, activityId)
  const reorderMutation = useReorderActivityGalleryMutation(
    portfolioId,
    activityId,
  )
  const updateMetadata = useUpdateMediaMetadataMutation(portfolioId)
  const softDelete = useSoftDeleteMediaMutation(portfolioId)
  const restore = useRestoreMediaMutation(portfolioId)

  const activeItems = useMemo(
    () => (data ?? []).filter((item) => !item.deleted_at),
    [data],
  )

  const move = async (mediaId: string, direction: -1 | 1) => {
    const ids = activeItems.map((item) => item.id)
    const index = ids.indexOf(mediaId)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return
    const swapped = [...ids]
    const current = swapped[index]
    swapped[index] = swapped[nextIndex]
    swapped[nextIndex] = current
    try {
      await reorderMutation.mutateAsync(swapped)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleSaveMetadata = async (
    media: Media,
    values: MediaMetadataValues,
  ) => {
    try {
      await updateMetadata.mutateAsync({ mediaId: media.id, metadata: values })
      toast.success('Gallery image details updated')
      setEditingId(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  if (!cloudinaryConfig) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Configure Cloudinary before uploading gallery images.{' '}
        <Link
          to={ROUTES.portfolios.cloudinarySettings(portfolioId)}
          className="font-medium text-primary underline underline-offset-2"
        >
          Go to Cloudinary settings
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ImageUploader
        cloudName={cloudinaryConfig.cloudName}
        uploadPreset={cloudinaryConfig.uploadPreset}
        folder={[
          cloudinaryConfig.defaultFolder,
          'activities',
          activityId,
          'gallery',
        ]
          .filter((segment): segment is string => Boolean(segment))
          .join('/')}
        accept={MEDIA_ACCEPTED_IMAGE_TYPES}
        maxSizeBytes={MEDIA_MAX_IMAGE_SIZE_BYTES}
        aspectClassName="aspect-video max-w-xs"
        uploadLabel="Add gallery images"
        multiple
        onUploadSuccess={async (result) => {
          await addMutation.mutateAsync(result)
          toast.success('Gallery image added')
        }}
        onUploadError={(error) => toast.error(getErrorMessage(error))}
      />

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={includeDeleted}
          onChange={(event) => setIncludeDeleted(event.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        Show deleted gallery images
      </label>

      {isLoading ? <LoadingState message="Loading gallery…" /> : null}

      {!isLoading && (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">
          No gallery images yet. Upload one or more images above.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {(data ?? []).map((item) => {
          const isDeleted = Boolean(item.deleted_at)
          const activeIndex = activeItems.findIndex((row) => row.id === item.id)

          return (
            <Card key={item.id} className={isDeleted ? 'opacity-60' : undefined}>
              <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                <CloudinaryImage
                  secureUrl={item.cloudinary_secure_url}
                  alt={item.alt_text_en ?? ''}
                  className="h-full w-full"
                />
              </div>
              <CardContent className="flex flex-col gap-3 pt-4">
                {editingId === item.id ? (
                  <MediaMetadataForm
                    media={item}
                    onSubmit={(values) => handleSaveMetadata(item, values)}
                    onCancel={() => setEditingId(null)}
                    isSubmitting={updateMetadata.isPending}
                  />
                ) : (
                  <>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.alt_text_en ||
                        item.caption_en ||
                        'No alt text or caption yet'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(item.id)}
                      >
                        Edit details
                      </Button>
                      {!isDeleted ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={
                              activeIndex <= 0 || reorderMutation.isPending
                            }
                            onClick={() => void move(item.id, -1)}
                            aria-label="Move earlier"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={
                              activeIndex === -1 ||
                              activeIndex >= activeItems.length - 1 ||
                              reorderMutation.isPending
                            }
                            onClick={() => void move(item.id, 1)}
                            aria-label="Move later"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={softDelete.isPending}
                            onClick={() => {
                              void softDelete
                                .mutateAsync(item.id)
                                .then(() => toast.success('Gallery image removed'))
                                .catch((error) =>
                                  toast.error(getErrorMessage(error)),
                                )
                            }}
                          >
                            {softDelete.isPending ? (
                              <Spinner />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Remove
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={restore.isPending}
                          onClick={() => {
                            void restore
                              .mutateAsync(item.id)
                              .then(() =>
                                toast.success('Gallery image restored'),
                              )
                              .catch((error) =>
                                toast.error(getErrorMessage(error)),
                              )
                          }}
                        >
                          {restore.isPending ? (
                            <Spinner />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          Restore
                        </Button>
                      )}
                    </div>
                    {!isDeleted ? (
                      <p className="text-xs text-muted-foreground">
                        Position {activeIndex + 1} of {activeItems.length}
                      </p>
                    ) : (
                      <p className="text-xs text-destructive">Deleted</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
