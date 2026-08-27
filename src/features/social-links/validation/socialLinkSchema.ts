import { z } from 'zod'
import { urlSchema } from '@/shared/validation'
import type { SocialPlatform } from '../types'

const SOCIAL_PLATFORM_VALUES = [
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
  'whatsapp',
  'website',
  'other',
] as const

const PLATFORM_HOSTS: Partial<Record<SocialPlatform, readonly string[]>> = {
  facebook: ['facebook.com', 'fb.com', 'fb.me'],
  twitter: ['twitter.com', 'x.com'],
  instagram: ['instagram.com', 'instagr.am'],
  youtube: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
  linkedin: ['linkedin.com', 'lnkd.in'],
  whatsapp: ['whatsapp.com', 'wa.me'],
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

function hostMatches(host: string, allowed: readonly string[]): boolean {
  return allowed.some((entry) => host === entry || host.endsWith(`.${entry}`))
}

/**
 * Only reject when the URL is clearly a *different* known social host
 * (e.g. an Instagram URL saved as Facebook). Custom/share domains stay valid.
 */
function isObviousPlatformMismatch(
  platform: SocialPlatform,
  url: string,
): boolean {
  const expected = PLATFORM_HOSTS[platform]
  if (!expected) return false
  const host = hostnameOf(url)
  if (!host) return false
  if (hostMatches(host, expected)) return false

  for (const [other, hosts] of Object.entries(PLATFORM_HOSTS)) {
    if (other === platform || !hosts) continue
    if (hostMatches(host, hosts)) return true
  }
  return false
}

export const socialLinkFormSchema = z
  .object({
    platform: z.enum(SOCIAL_PLATFORM_VALUES),
    url: z.string().trim().pipe(urlSchema),
    custom_label: z.string().trim().max(80, 'Label is too long'),
    is_visible: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.platform === 'other' && !data.custom_label) {
      ctx.addIssue({
        code: 'custom',
        path: ['custom_label'],
        message: 'A label is required when the platform is Other',
      })
    }

    if (isObviousPlatformMismatch(data.platform, data.url)) {
      ctx.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'This URL looks like a different social platform',
      })
    }
  })

export type SocialLinkFormValues = z.infer<typeof socialLinkFormSchema>
