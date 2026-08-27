import { z } from 'zod'
import { slugSchema, requiredString } from '@/shared/validation'

const ACTIVITY_STATUS_VALUES = ['draft', 'scheduled', 'published', 'archived'] as const

export interface PublishableFields {
  title_en?: string | null
  title_hi?: string | null
  description_en?: string | null
  description_hi?: string | null
  activity_date?: string | null
}

/** Fields that must be present before an activity can be published or scheduled. */
export function getMissingPublishFields(fields: PublishableFields): string[] {
  const missing: string[] = []
  if (!fields.title_en?.trim()) missing.push('English title')
  if (!fields.title_hi?.trim()) missing.push('Hindi title')
  if (!fields.description_en?.trim()) missing.push('English description')
  if (!fields.description_hi?.trim()) missing.push('Hindi description')
  if (!fields.activity_date?.trim()) missing.push('Activity date')
  return missing
}

export const activityFormSchema = z
  .object({
    title_en: requiredString('English title').max(200, 'English title is too long'),
    title_hi: requiredString('Hindi title').max(200, 'Hindi title is too long'),
    slug: slugSchema,
    description_en: z.string().max(10000, 'English description is too long'),
    description_hi: z.string().max(10000, 'Hindi description is too long'),
    location_en: z.string().max(200, 'English location is too long'),
    location_hi: z.string().max(200, 'Hindi location is too long'),
    activity_date: z.string(),
    display_date: z.string().max(120, 'Display date is too long'),
    status: z.enum(ACTIVITY_STATUS_VALUES),
    publish_at: z.string(),
    is_featured: z.boolean(),
    sort_order: z.number().int().min(0).max(999_999),
  })
  .superRefine((data, ctx) => {
    const requiresCompleteContent =
      data.status === 'published' || data.status === 'scheduled'

    if (requiresCompleteContent) {
      const missing = getMissingPublishFields(data)
      const pathByLabel: Record<string, keyof typeof data> = {
        'English title': 'title_en',
        'Hindi title': 'title_hi',
        'English description': 'description_en',
        'Hindi description': 'description_hi',
        'Activity date': 'activity_date',
      }
      for (const label of missing) {
        ctx.addIssue({
          code: 'custom',
          path: [pathByLabel[label]],
          message: `${label} is required to publish or schedule`,
        })
      }
    }

    if (data.status === 'scheduled' && !data.publish_at.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['publish_at'],
        message: 'Publish time is required for scheduled activities',
      })
    }
  })

export type ActivityFormValues = z.infer<typeof activityFormSchema>
