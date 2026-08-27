import { z } from 'zod'
import { slugSchema, requiredString } from '@/shared/validation'
import { AVAILABLE_THEMES } from '../constants'

/** Fields captured when creating a portfolio. Bilingual name is required; the
 *  rest are optional and can be filled in later from the profile screen. */
export const createPortfolioSchema = z.object({
  full_name_en: requiredString('English name'),
  full_name_hi: requiredString('Hindi name'),
  slug: slugSchema,
  designation_en: z.string().trim().max(200).optional(),
  designation_hi: z.string().trim().max(200).optional(),
  theme: z.string().min(1, 'Theme is required'),
})

export type CreatePortfolioValues = z.infer<typeof createPortfolioSchema>

/** Fields editable from the Portfolio Profile screen. */
export const updatePortfolioSchema = z.object({
  full_name_en: requiredString('English name'),
  full_name_hi: requiredString('Hindi name'),
  designation_en: z.string().trim().max(200).optional(),
  designation_hi: z.string().trim().max(200).optional(),
  about_en: z.string().trim().max(5000).optional(),
  about_hi: z.string().trim().max(5000).optional(),
  slug: slugSchema,
  status: z.enum(['active', 'inactive']),
  theme: z.enum(AVAILABLE_THEMES),
})

export type UpdatePortfolioValues = z.infer<typeof updatePortfolioSchema>
