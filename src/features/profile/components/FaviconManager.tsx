import toast from 'react-hot-toast'
import { RoleImageManager, type Media } from '@/features/media'
import { getErrorMessage } from '@/shared/utils'
import { useSetFaviconMutation } from '../hooks/useSetFaviconMutation'

export interface FaviconManagerProps {
  portfolioId: string
  cloudinaryConfig: {
    cloudName: string
    uploadPreset: string
    defaultFolder?: string | null
  } | null
}

/**
 * Wraps the shared favicon media role with the extra step favicons require:
 * persisting `portfolio_settings.favicon_media_id` so the settings row points
 * at the current favicon media row (never the URL directly).
 */
export function FaviconManager({ portfolioId, cloudinaryConfig }: FaviconManagerProps) {
  const setFavicon = useSetFaviconMutation(portfolioId)

  const handleChange = async (media: Media | null) => {
    try {
      await setFavicon.mutateAsync(media?.id ?? null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <RoleImageManager
      portfolioId={portfolioId}
      role="favicon"
      cloudinaryConfig={cloudinaryConfig}
      label="Favicon"
      helpText="Small icon used by the public site's browser tab."
      aspectClassName="aspect-square max-w-[8rem]"
      onChange={(media) => void handleChange(media)}
    />
  )
}
