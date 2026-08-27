import { z } from 'zod'

/** Bilingual media metadata. Both languages are always entered manually —
 *  no translation API or automatic translation is used. */
export const mediaMetadataSchema = z.object({
  alt_text_en: z.string().trim().max(300).optional(),
  alt_text_hi: z.string().trim().max(300).optional(),
  caption_en: z.string().trim().max(500).optional(),
  caption_hi: z.string().trim().max(500).optional(),
})

export type MediaMetadataValues = z.infer<typeof mediaMetadataSchema>
