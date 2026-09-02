// Public API of the media feature.
export { MediaPage } from './pages/MediaPage'
export { RoleImageManager } from './components/RoleImageManager'
export { MediaMetadataForm } from './components/MediaMetadataForm'

export { useMediaListQuery } from './hooks/useMediaListQuery'
export { usePortfolioRoleMediaQuery } from './hooks/usePortfolioRoleMediaQuery'
export { useActivityCoverQuery } from './hooks/useActivityCoverQuery'
export { useActivityCoversQuery } from './hooks/useActivityCoversQuery'
export { useActivityGalleryQuery } from './hooks/useActivityGalleryQuery'
export { useReplaceActivityCoverMutation } from './hooks/useReplaceActivityCoverMutation'
export { useAddActivityGalleryImageMutation } from './hooks/useAddActivityGalleryImageMutation'
export { useReorderActivityGalleryMutation } from './hooks/useReorderActivityGalleryMutation'
export { useSoftDeleteMediaMutation } from './hooks/useSoftDeleteMediaMutation'
export { useRestoreMediaMutation } from './hooks/useRestoreMediaMutation'
export { useUpdateMediaMetadataMutation } from './hooks/useUpdateMediaMetadataMutation'

export { mediaService } from './services/mediaService'
export { mediaKeys } from './constants/queryKeys'
export { MEDIA_ACCEPTED_IMAGE_TYPES, MEDIA_MAX_IMAGE_SIZE_BYTES } from './constants'

export type {
  Media,
  MediaRole,
  MediaKind,
  PortfolioMediaRole,
  ActivityMediaRole,
} from './types'
export type { MediaMetadataValues } from './validation/mediaMetadataSchema'
