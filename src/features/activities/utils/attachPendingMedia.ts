import { createCloudinaryUploader } from '@/shared/lib/cloudinary'
import { mediaService } from '@/features/media'
import type { PendingActivityMediaValue } from '../components/PendingActivityMedia'

export async function attachPendingActivityMedia(
  portfolioId: string,
  activityId: string,
  cloudinaryConfig: {
    cloudName: string
    uploadPreset: string
    defaultFolder?: string | null
  },
  pending: PendingActivityMediaValue,
): Promise<void> {
  const uploader = createCloudinaryUploader({
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
    defaultFolder: cloudinaryConfig.defaultFolder,
  })

  const folderPrefix = [cloudinaryConfig.defaultFolder, 'activities', activityId]
    .filter((segment): segment is string => Boolean(segment))
    .join('/')

  if (pending.cover) {
    const coverUpload = await uploader.upload(pending.cover.file, {
      folder: `${folderPrefix}/cover`,
    })
    await mediaService.replaceActivityCover(portfolioId, activityId, coverUpload)
  }

  for (const item of pending.gallery) {
    const galleryUpload = await uploader.upload(item.file, {
      folder: `${folderPrefix}/gallery`,
    })
    await mediaService.addActivityGalleryImage(
      portfolioId,
      activityId,
      galleryUpload,
    )
  }
}
