export interface CloudinaryTransform {
  width?: number
  height?: number
  /** Crop/resize mode, e.g. 'fill', 'fit', 'thumb'. */
  crop?: string
  /** Quality, e.g. 'auto' or a number. */
  quality?: string | number
  /** Format, e.g. 'auto', 'webp'. */
  format?: string
}

/**
 * Builds a Cloudinary delivery URL from a public_id + transform. Useful for
 * rendering optimized thumbnails without storing multiple URLs. When no
 * transform is needed, the stored secure_url should be used directly.
 */
export function buildCloudinaryUrl(
  cloudName: string,
  publicId: string,
  transform: CloudinaryTransform = {},
): string {
  const parts: string[] = []
  if (transform.crop) parts.push(`c_${transform.crop}`)
  if (transform.width) parts.push(`w_${transform.width}`)
  if (transform.height) parts.push(`h_${transform.height}`)
  parts.push(`q_${transform.quality ?? 'auto'}`)
  parts.push(`f_${transform.format ?? 'auto'}`)

  const transformSegment = parts.join(',')
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformSegment}/${publicId}`
}
