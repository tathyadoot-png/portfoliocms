import { z } from 'zod'

/** URL-safe slug: lowercase letters/numbers/Devanagari separated by hyphens. */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(120, 'Slug is too long')
  .regex(
    /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u,
    'Use lowercase words separated by single hyphens',
  )

export const urlSchema = z.url('Enter a valid URL')

export const optionalUrlSchema = z
  .union([urlSchema, z.literal('')])
  .transform((value) => (value === '' ? undefined : value))
  .optional()

/** A non-empty trimmed string. */
export const requiredString = (label: string) =>
  z.string().trim().min(1, `${label} is required`)
