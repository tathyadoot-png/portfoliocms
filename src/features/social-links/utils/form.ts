import type { SocialLink, SocialLinkWriteInput } from '../types'
import type { SocialLinkFormValues } from '../validation/socialLinkSchema'

export function toFormValues(link?: SocialLink | null): SocialLinkFormValues {
  return {
    platform: link?.platform ?? 'website',
    url: link?.url ?? '',
    custom_label: link?.custom_label ?? '',
    is_visible: link?.is_visible ?? true,
  }
}

export function toWriteInput(values: SocialLinkFormValues): SocialLinkWriteInput {
  const label = values.custom_label.trim()
  return {
    platform: values.platform,
    url: values.url.trim(),
    custom_label: values.platform === 'other' && label ? label : null,
    is_visible: values.is_visible,
  }
}
