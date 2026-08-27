import { z } from 'zod'
import { optionalUrlSchema } from '@/shared/validation'

const optionalEmail = z
  .union([z.email('Enter a valid email address'), z.literal('')])
  .transform((value) => (value === '' ? undefined : value))
  .optional()

export const portfolioSettingsSchema = z.object({
  contact_email: optionalEmail,
  contact_phone: z.string().trim().max(30).optional(),
  address_en: z.string().trim().max(500).optional(),
  address_hi: z.string().trim().max(500).optional(),
  google_map_url: optionalUrlSchema,
  copyright_text_en: z.string().trim().max(300).optional(),
  copyright_text_hi: z.string().trim().max(300).optional(),
})

export type PortfolioSettingsValues = z.infer<typeof portfolioSettingsSchema>
