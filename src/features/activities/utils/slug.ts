import { slugify } from '@/shared/utils'

const MAX_SLUG_LENGTH = 120
const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function baseSlugFromTitles(titleEn: string, titleHi: string): string {
  const raw = slugify(titleEn) || slugify(titleHi) || 'activity'
  return raw.slice(0, MAX_SLUG_LENGTH)
}

export function randomSlugSuffix(): string {
  const length = 3 + Math.floor(Math.random() * 3)
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => SUFFIX_ALPHABET[byte % SUFFIX_ALPHABET.length]).join(
    '',
  )
}

export function slugWithSuffix(base: string, suffix: string): string {
  const clipped = (base || 'activity').slice(0, Math.max(1, MAX_SLUG_LENGTH - suffix.length - 1))
  return `${clipped}-${suffix}`
}
