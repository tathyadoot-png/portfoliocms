import type { ImgHTMLAttributes } from 'react'
import { cn } from '@/shared/utils'

export interface CloudinaryImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** The stored `cloudinary_secure_url` from a media row. */
  secureUrl: string
  alt: string
}

/**
 * Dumb display component for a Cloudinary-hosted image. It renders a stored
 * secure URL and holds no credentials — the uploader (createCloudinaryUploader)
 * owns credentials, this only displays results.
 */
export function CloudinaryImage({
  secureUrl,
  alt,
  className,
  loading = 'lazy',
  ...props
}: CloudinaryImageProps) {
  return (
    <img
      src={secureUrl}
      alt={alt}
      loading={loading}
      className={cn('object-cover', className)}
      {...props}
    />
  )
}
