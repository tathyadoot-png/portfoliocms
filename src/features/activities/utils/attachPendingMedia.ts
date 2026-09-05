import { createCloudinaryUploader } from '@/shared/lib/cloudinary'
import { mediaService, type Media } from '@/features/media'
import type { ActivityImagesValue } from './activityImages'

export async function persistActivityImages(
  portfolioId: string,
  activityId: string,
  cloudinaryConfig: {
    cloudName: string
    uploadPreset: string
    defaultFolder?: string | null
  },
  value: ActivityImagesValue,
  existing: Media[],
): Promise<void> {
  const uploader = createCloudinaryUploader({
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
    defaultFolder: cloudinaryConfig.defaultFolder,
  })

  const folder = [cloudinaryConfig.defaultFolder, 'activities', activityId]
    .filter((segment): segment is string => Boolean(segment))
    .join('/')

  const keptExistingIds = new Set(
    value.items
      .filter((item) => item.kind === 'existing')
      .map((item) => item.mediaId),
  )

  for (const row of existing) {
    if (!keptExistingIds.has(row.id)) {
      await mediaService.softDelete(row.id)
    }
  }

  if (value.items.length === 0) {
    return
  }

  const resolvedIds: string[] = []

  for (let index = 0; index < value.items.length; index += 1) {
    const item = value.items[index]
    const isCover = item.key === value.coverKey
    const role = isCover ? 'cover' : 'gallery'

    if (item.kind === 'existing') {
      resolvedIds.push(item.mediaId)
      continue
    }

    const upload = await uploader.upload(item.file, { folder })
    const inserted = await mediaService.insertActivityImage(
      portfolioId,
      activityId,
      upload,
      role,
      index,
    )
    resolvedIds.push(inserted.id)
  }

  const coverIndex = value.items.findIndex((item) => item.key === value.coverKey)
  const coverResolvedIndex = coverIndex >= 0 ? coverIndex : 0

  await mediaService.applyActivityImageRoles(
    portfolioId,
    activityId,
    resolvedIds.map((id, index) => ({
      id,
      role: index === coverResolvedIndex ? 'cover' : 'gallery',
      sortOrder: index,
    })),
  )
}
