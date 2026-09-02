import type { Activity, ActivityWriteInput } from '../types'
import type { ActivityFormValues } from '../validation/activitySchema'
import { emptyToNull } from './errors'
import { fromDatetimeLocal, localDateYmd, toDatetimeLocal } from './datetime'

export function toFormValues(activity?: Activity | null): ActivityFormValues {
  return {
    title_en: activity?.title_en ?? '',
    title_hi: activity?.title_hi ?? '',
    description_en: activity?.description_en ?? '',
    description_hi: activity?.description_hi ?? '',
    location_en: activity?.location_en ?? '',
    location_hi: activity?.location_hi ?? '',
    activity_date: activity
      ? (activity.activity_date ?? '')
      : localDateYmd(),
    status: activity?.status ?? 'published',
    publish_at: toDatetimeLocal(activity?.publish_at),
    is_featured: activity?.is_featured ?? true,
    sort_order: activity?.sort_order ?? 0,
  }
}

export function toWriteInput(
  values: ActivityFormValues,
  existingSlug = '',
  options?: { existingActivityDate?: string | null; isCreate?: boolean },
): ActivityWriteInput {
  const activityDate = options?.isCreate
    ? (emptyToNull(values.activity_date) ?? localDateYmd())
    : (emptyToNull(values.activity_date) ??
      emptyToNull(options?.existingActivityDate) ??
      localDateYmd())

  return {
    slug: existingSlug,
    title_en: values.title_en.trim(),
    title_hi: values.title_hi.trim(),
    description_en: emptyToNull(values.description_en),
    description_hi: emptyToNull(values.description_hi),
    location_en: emptyToNull(values.location_en),
    location_hi: emptyToNull(values.location_hi),
    activity_date: activityDate,
    // Canonical date is activity_date. Keep display_date populated for
    // existing public-site readers without a second CMS input.
    display_date: activityDate,
    status: values.status,
    publish_at: fromDatetimeLocal(values.publish_at),
    is_featured: values.is_featured,
    sort_order: Number.isFinite(values.sort_order) ? values.sort_order : 0,
  }
}
