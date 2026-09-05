import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui'
import { LoadingState } from '@/shared/components/feedback'
import { cn } from '@/shared/utils'
import {
  MEDIA_ACCEPTED_IMAGE_TYPES,
  MEDIA_MAX_IMAGE_SIZE_BYTES,
  useActivityImagesQuery,
} from '@/features/media'
import {
  ensureCover,
  imagesFromExistingMedia,
  revokePending,
  type ActivityImageItem,
  type ActivityImagesValue,
} from '../utils/activityImages'

function validateImage(file: File): string | null {
  const allowed = MEDIA_ACCEPTED_IMAGE_TYPES.split(',').map((type) => type.trim())
  if (!allowed.includes(file.type)) {
    return `Unsupported file type. Allowed: ${MEDIA_ACCEPTED_IMAGE_TYPES}`
  }
  if (file.size > MEDIA_MAX_IMAGE_SIZE_BYTES) {
    return `File is too large. Maximum size is ${(MEDIA_MAX_IMAGE_SIZE_BYTES / (1024 * 1024)).toFixed(1)} MB.`
  }
  return null
}

export interface ActivityImagesFieldProps {
  portfolioId: string
  activityId?: string
  value: ActivityImagesValue
  onChange: (next: ActivityImagesValue) => void
  disabled?: boolean
  cloudinaryConfigured: boolean
}

export function ActivityImagesField({
  portfolioId,
  activityId,
  value,
  onChange,
  disabled = false,
  cloudinaryConfigured,
}: ActivityImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef(value)
  const hydratedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  const { data: existingMedia, isLoading } = useActivityImagesQuery(
    portfolioId,
    activityId,
  )

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    return () => {
      valueRef.current.items.forEach(revokePending)
    }
  }, [])

  useEffect(() => {
    if (!activityId || hydratedRef.current || !existingMedia) return
    hydratedRef.current = true
    onChange(imagesFromExistingMedia(existingMedia))
  }, [activityId, existingMedia, onChange])

  const commit = (next: ActivityImagesValue) => {
    const normalized = ensureCover({ ...next, hydrated: true })
    valueRef.current = normalized
    onChange(normalized)
  }

  const addFiles = (files: File[]) => {
    const added: ActivityImageItem[] = []
    for (const file of files) {
      const validationError = validateImage(file)
      if (validationError) {
        added.forEach(revokePending)
        setError(validationError)
        return
      }
      added.push({
        kind: 'pending',
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }
    setError(null)
    const items = [...value.items, ...added]
    commit({
      items,
      coverKey: value.coverKey ?? items[0]?.key ?? null,
      hydrated: true,
    })
  }

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= value.items.length) return
    const items = [...value.items]
    const current = items[index]
    items[index] = items[nextIndex]
    items[nextIndex] = current
    commit({ ...value, items })
  }

  const removeAt = (index: number) => {
    revokePending(value.items[index])
    commit({
      ...value,
      items: value.items.filter((_, itemIndex) => itemIndex !== index),
    })
  }

  if (!cloudinaryConfigured) {
    return (
      <p className="text-sm text-muted-foreground">
        Configure Cloudinary to attach images. You can still save the activity
        without images.
      </p>
    )
  }

  if (activityId && isLoading && value.items.length === 0) {
    return <LoadingState message="Loading images…" />
  }

  const busy = disabled || Boolean(activityId && isLoading)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="text-sm font-medium text-foreground">Images</p>
      <p className="text-sm text-muted-foreground">
        The first image is Cover by default. Select Cover on any image before
        saving. All images are stored; only one can be Cover.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_ACCEPTED_IMAGE_TYPES}
        multiple
        className="hidden"
        disabled={busy}
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []))
          event.target.value = ''
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {value.items.length > 0 ? 'Add images' : 'Select images'}
      </Button>

      {value.items.length === 0 ? (
        <div className="relative flex aspect-video w-full max-w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted sm:max-w-sm">
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {value.items.map((item, index) => {
            const src = item.kind === 'pending' ? item.previewUrl : item.url
            const isCover = item.key === value.coverKey

            return (
              <div
                key={item.key}
                className={cn(
                  'min-w-0 overflow-hidden rounded-lg border',
                  isCover
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border',
                )}
              >
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col gap-2 p-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="radio"
                      name="activity-cover"
                      className="h-4 w-4"
                      checked={isCover}
                      disabled={disabled}
                      onChange={() => commit({ ...value, coverKey: item.key })}
                    />
                    Cover
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={disabled || index === 0}
                      onClick={() => move(index, -1)}
                      aria-label="Move earlier"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={disabled || index === value.items.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label="Move later"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      onClick={() => removeAt(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
