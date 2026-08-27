import type { SocialPlatform } from '../types'

export { socialLinkKeys } from './queryKeys'

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
  'whatsapp',
  'website',
  'other',
]

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  website: 'Website',
  other: 'Other',
}
