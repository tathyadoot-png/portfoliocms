import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/utils'
import {
  MEDIA_ACCEPTED_IMAGE_TYPES,
  MEDIA_MAX_IMAGE_SIZE_BYTES,
} from '@/features/media'

export interface PendingImage {
  file: File
  previewUrl: string
}

export interface PendingActivityMediaValue {
  cover: PendingImage | null
  gallery: PendingImage[]
}

export interface PendingActivityMediaProps {
  value: PendingActivityMediaValue
  onChange: (next: PendingActivityMediaValue) => void
  disabled?: boolean
  cloudinaryConfigured: boolean
}

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

function revokePreview(image: PendingImage | null | undefined) {
  if (image?.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(image.previewUrl)
  }
}

export function PendingActivityMedia({
  value,
  onChange,
  disabled = false,
  cloudinaryConfigured,
}: PendingActivityMediaProps) {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef(value)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    return () => {
      const current = valueRef.current
      revokePreview(current.cover)
      current.gallery.forEach(revokePreview)
    }
  }, [])

  if (!cloudinaryConfigured) {
    return (
      <p className="text-sm text-muted-foreground">
        Configure Cloudinary to attach a cover or gallery when creating. You can
        still create the activity without images.
      </p>
    )
  }

  const commit = (next: PendingActivityMediaValue) => {
    valueRef.current = next
    onChange(next)
  }

  const pickCover = (file: File | undefined) => {
    if (!file) return
    const validationError = validateImage(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    revokePreview(value.cover)
    commit({
      ...value,
      cover: { file, previewUrl: URL.createObjectURL(file) },
    })
  }

  const pickGallery = (files: File[]) => {
    const added: PendingImage[] = []
    for (const file of files) {
      const validationError = validateImage(file)
      if (validationError) {
        added.forEach(revokePreview)
        setError(validationError)
        return
      }
      added.push({ file, previewUrl: URL.createObjectURL(file) })
    }
    setError(null)
    commit({ ...value, gallery: [...value.gallery, ...added] })
  }

  const moveGallery = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= value.gallery.length) return
    const next = [...value.gallery]
    const current = next[index]
    next[index] = next[nextIndex]
    next[nextIndex] = current
    commit({ ...value, gallery: next })
  }

  const removeGallery = (index: number) => {
    revokePreview(value.gallery[index])
    commit({
      ...value,
      gallery: value.gallery.filter((_, itemIndex) => itemIndex !== index),
    })
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Cover image</p>
        <div className="flex flex-col gap-3">
          <div className="relative flex aspect-video w-full max-w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted sm:max-w-sm">
            {value.cover ? (
              <img
                src={value.cover.previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept={MEDIA_ACCEPTED_IMAGE_TYPES}
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              pickCover(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => coverInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {value.cover ? 'Replace cover' : 'Select cover'}
            </Button>
            {value.cover ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  revokePreview(value.cover)
                  commit({ ...value, cover: null })
                }}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Gallery</p>
        <input
          ref={galleryInputRef}
          type="file"
          accept={MEDIA_ACCEPTED_IMAGE_TYPES}
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            pickGallery(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => galleryInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Add gallery images
        </Button>

        {value.gallery.length > 0 ? (
          <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
            {value.gallery.map((item, index) => (
              <div
                key={item.previewUrl}
                className="min-w-0 overflow-hidden rounded-lg border border-border"
              >
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled || index === 0}
                    onClick={() => moveGallery(index, -1)}
                    aria-label="Move earlier"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled || index === value.gallery.length - 1}
                    onClick={() => moveGallery(index, 1)}
                    aria-label="Move later"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => removeGallery(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Optional. Selected images upload after the activity is created.
          </p>
        )}
      </div>

      {error ? <p className={cn('text-xs text-destructive')}>{error}</p> : null}
    </div>
  )
}
