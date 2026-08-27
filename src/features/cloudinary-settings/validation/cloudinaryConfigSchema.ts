import { z } from 'zod'
import { requiredString } from '@/shared/validation'

/**
 * V1 uses unsigned direct browser uploads only: no api_key, no api_secret,
 * no signed-upload fields exist here or anywhere else in this schema.
 */
export const cloudinaryConfigSchema = z.object({
  cloud_name: requiredString('Cloud name'),
  upload_preset: requiredString('Upload preset'),
  default_folder: z.string().trim().max(200).optional(),
})

export type CloudinaryConfigValues = z.infer<typeof cloudinaryConfigSchema>
