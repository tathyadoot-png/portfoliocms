import type { Media } from '@/features/media'

export type ActivityImageItem =
  | { kind: 'existing'; key: string; mediaId: string; url: string }
  | { kind: 'pending'; key: string; file: File; previewUrl: string }

export interface ActivityImagesValue {
  items: ActivityImageItem[]
  coverKey: string | null
  hydrated: boolean
}

export const EMPTY_ACTIVITY_IMAGES: ActivityImagesValue = {
  items: [],
  coverKey: null,
  hydrated: false,
}

export const EMPTY_ACTIVITY_IMAGES_CREATE: ActivityImagesValue = {
  items: [],
  coverKey: null,
  hydrated: true,
}

export function imagesFromExistingMedia(media: Media[]): ActivityImagesValue {
  const items: ActivityImageItem[] = media.map((row) => ({
    kind: 'existing' as const,
    key: row.id,
    mediaId: row.id,
    url: row.cloudinary_secure_url,
  }))
  const cover = media.find((row) => row.role === 'cover')
  return {
    items,
    coverKey: cover?.id ?? items[0]?.key ?? null,
    hydrated: true,
  }
}

export function ensureCover(value: ActivityImagesValue): ActivityImagesValue {
  if (value.items.length === 0) {
    return { items: [], coverKey: null, hydrated: value.hydrated }
  }
  const coverStillPresent = value.items.some((item) => item.key === value.coverKey)
  if (coverStillPresent && value.coverKey) {
    return value
  }
  return { ...value, coverKey: value.items[0].key }
}

export function revokePending(item: ActivityImageItem) {
  if (item.kind === 'pending' && item.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(item.previewUrl)
  }
}
