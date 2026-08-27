import type { Activity, ActivityWriteInput } from '../types'
import type { ActivityFormValues } from '../validation/activitySchema'
import { emptyToNull } from './errors'
import { fromDatetimeLocal, toDatetimeLocal } from './datetime'

export function toFormValues(activity?: Activity | null): ActivityFormValues {
  return {
    title_en: activity?.title_en ?? '',
    title_hi: activity?.title_hi ?? '',
    slug: activity?.slug ?? '',
    description_en: activity?.description_en ?? '',
    description_hi: activity?.description_hi ?? '',
    location_en: activity?.location_en ?? '',
    location_hi: activity?.location_hi ?? '',
    activity_date: activity?.activity_date ?? '',
    display_date: activity?.display_date ?? '',
    status: activity?.status ?? 'draft',
    publish_at: toDatetimeLocal(activity?.publish_at),
    is_featured: activity?.is_featured ?? false,
    sort_order: activity?.sort_order ?? 0,
  }
}

export function toWriteInput(values: ActivityFormValues): ActivityWriteInput {
  return {
    slug: values.slug,
    title_en: values.title_en.trim(),
    title_hi: values.title_hi.trim(),
    description_en: emptyToNull(values.description_en),
    description_hi: emptyToNull(values.description_hi),
    location_en: emptyToNull(values.location_en),
    location_hi: emptyToNull(values.location_hi),
    activity_date: emptyToNull(values.activity_date),
    display_date: emptyToNull(values.display_date),
    status: values.status,
    publish_at: fromDatetimeLocal(values.publish_at),
    is_featured: values.is_featured,
    sort_order: Number.isFinite(values.sort_order) ? values.sort_order : 0,
  }
}
