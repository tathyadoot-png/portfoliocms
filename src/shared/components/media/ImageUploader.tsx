import { useRef, useState } from 'react'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui'
import { Spinner } from '@/shared/components/ui'
import { cn, getErrorMessage } from '@/shared/utils'
import { createCloudinaryUploader } from '@/shared/lib/cloudinary'
import type { CloudinaryUploadResult } from '@/shared/lib/cloudinary'

export interface ImageUploaderProps {
  /** Per-portfolio Cloudinary credentials — never hardcoded, always injected. */
  cloudName: string
  uploadPreset: string
  folder?: string
  currentImageUrl?: string | null
  alt?: string
  /** Defaults to 'image/*'. */
  accept?: string
  /** Defaults to 8MB. */
  maxSizeBytes?: number
  disabled?: boolean
  uploadLabel?: string
  className?: string
  aspectClassName?: string
  onUploadSuccess: (result: CloudinaryUploadResult) => void | Promise<void>
  onUploadError?: (error: unknown) => void
  /** Rendered only when provided — parent decides whether removal is allowed. */
  onRemove?: () => void | Promise<void>
  /** When true, the file input accepts multiple images and uploads them sequentially. */
  multiple?: boolean
}

const DEFAULT_MAX_SIZE_BYTES = 8 * 1024 * 1024
const DEFAULT_ACCEPT = 'image/*'

/**
 * Feature-agnostic Cloudinary image uploader. Validates the file, uploads it
 * directly to Cloudinary using unsigned credentials passed in via props, and
 * reports the raw result upward. It never talks to Supabase — the parent
 * feature/service is responsible for persisting a `media` row after a
 * successful upload.
 */
export function ImageUploader({
  cloudName,
  uploadPreset,
  folder,
  currentImageUrl,
  alt = '',
  accept = DEFAULT_ACCEPT,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  disabled = false,
  uploadLabel = 'Upload image',
  className,
  aspectClassName = 'aspect-square',
  onUploadSuccess,
  onUploadError,
  onRemove,
  multiple = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [localError, setLocalError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const displayedUrl = previewUrl ?? currentImageUrl ?? null

  const validateFile = (file: File): string | null => {
    if (accept !== '*' && accept !== 'image/*') {
      const allowed = accept.split(',').map((t) => t.trim())
      if (!allowed.includes(file.type)) {
        return `Unsupported file type. Allowed: ${accept}`
      }
    } else if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed.'
    }

    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1)
      return `File is too large. Maximum size is ${maxMb} MB.`
    }

    return null
  }

  const handleFileSelected = async (file: File) => {
    setLocalError(null)

    const validationError = validateFile(file)
    if (validationError) {
      setLocalError(validationError)
      onUploadError?.(new Error(validationError))
      return
    }

    const objectUrl = URL.createObjectURL(file)
    if (!multiple) {
      setPreviewUrl(objectUrl)
    }
    setIsUploading(true)
    setProgress(0)

    try {
      const uploader = createCloudinaryUploader({ cloudName, uploadPreset })
      const result = await uploader.upload(file, {
        folder,
        onProgress: setProgress,
      })
      await onUploadSuccess(result)
    } catch (error) {
      setLocalError(getErrorMessage(error))
      onUploadError?.(error)
    } finally {
      setIsUploading(false)
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(null)
    }
  }

  const handleRemove = async () => {
    if (!onRemove) return
    setIsRemoving(true)
    setLocalError(null)
    try {
      await onRemove()
    } catch (error) {
      setLocalError(getErrorMessage(error))
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        className={cn(
          'relative flex w-full max-w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted sm:max-w-xs',
          aspectClassName,
        )}
      >
        {displayedUrl ? (
          <img
            src={displayedUrl}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlus className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        )}

        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80">
            <Spinner className="h-5 w-5" />
            <span className="text-xs font-medium text-foreground">
              Uploading… {progress}%
            </span>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => {
          const files = event.target.files
            ? Array.from(event.target.files)
            : []
          event.target.value = ''
          void (async () => {
            for (const file of files) {
              await handleFileSelected(file)
            }
          })()
        }}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {displayedUrl ? 'Replace' : uploadLabel}
        </Button>

        {onRemove && currentImageUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isUploading || isRemoving}
            onClick={() => void handleRemove()}
          >
            {isRemoving ? <Spinner /> : <Trash2 className="h-4 w-4" />}
            Remove
          </Button>
        ) : null}
      </div>

      {localError ? (
        <p className="text-xs text-destructive">{localError}</p>
      ) : null}
    </div>
  )
}
