import { supabase } from '@/shared/lib/supabase'
import { isUniqueViolation } from '@/shared/utils'
import { getMissingPublishFields } from '../validation/activitySchema'
import { localDateYmd } from '../utils/datetime'
import {
  baseSlugFromTitles,
  randomSlugSuffix,
  slugWithSuffix,
} from '../utils/slug'
import type {
  Activity,
  ActivityInsert,
  ActivityListFilters,
  ActivityUpdate,
  ActivityWriteInput,
} from '../types'

const SLUG_ALLOCATE_ATTEMPTS = 12
const SLUG_INSERT_RETRIES = 6

function escapeIlikeTerm(search: string): string {
  return search.replaceAll(/[,()%]/g, ' ').trim()
}

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

async function getScoped(
  portfolioId: string,
  activityId: string,
): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('id', activityId)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error('Activity not found in this portfolio.')
  }
  return data
}

function withPublishAt(
  input: ActivityWriteInput,
): Pick<ActivityWriteInput, 'status' | 'publish_at'> {
  if (input.status === 'published' && !input.publish_at) {
    return { status: input.status, publish_at: new Date().toISOString() }
  }
  return { status: input.status, publish_at: input.publish_at }
}

function assertCanPublish(activity: Activity): void {
  const missing = getMissingPublishFields(activity)
  if (missing.length > 0) {
    throw new Error(
      `Cannot publish until these fields are filled: ${missing.join(', ')}`,
    )
  }
}

async function slugExists(
  portfolioId: string,
  slug: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('activities')
    .select('id')
    .eq('portfolio_id', portfolioId)
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

async function allocateUniqueSlug(
  portfolioId: string,
  titleEn: string,
  titleHi: string,
  forceSuffix = false,
): Promise<string> {
  const base = baseSlugFromTitles(titleEn, titleHi)

  if (!forceSuffix && !(await slugExists(portfolioId, base))) {
    return base
  }

  for (let attempt = 0; attempt < SLUG_ALLOCATE_ATTEMPTS; attempt += 1) {
    const candidate = slugWithSuffix(base, randomSlugSuffix())
    if (!(await slugExists(portfolioId, candidate))) {
      return candidate
    }
  }

  throw new Error('Could not generate a unique slug. Please try again.')
}

function assertCanSchedule(activity: Activity, publishAt: string): void {
  const missing = getMissingPublishFields(activity)
  if (missing.length > 0) {
    throw new Error(
      `Cannot schedule until these fields are filled: ${missing.join(', ')}`,
    )
  }
  if (!publishAt.trim()) {
    throw new Error('Publish time is required to schedule an activity.')
  }
}

/**
 * All Supabase access for the `activities` table. Every function requires an
 * explicit portfolioId — queries are never global and then filtered in React.
 */
export const activitiesService = {
  async list(
    portfolioId: string,
    filters: ActivityListFilters = {},
  ): Promise<Activity[]> {
    let query = supabase
      .from('activities')
      .select('*')
      .eq('portfolio_id', portfolioId)

    if (!filters.includeDeleted) {
      query = query.is('deleted_at', null)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (typeof filters.isFeatured === 'boolean') {
      query = query.eq('is_featured', filters.isFeatured)
    }
    if (filters.activityDateFrom) {
      query = query.gte('activity_date', filters.activityDateFrom)
    }
    if (filters.activityDateTo) {
      query = query.lte('activity_date', filters.activityDateTo)
    }
    if (filters.search) {
      const term = `%${escapeIlikeTerm(filters.search)}%`
      query = query.or(
        `title_en.ilike.${term},title_hi.ilike.${term},slug.ilike.${term},location_en.ilike.${term},location_hi.ilike.${term}`,
      )
    }

    const { data, error } = await query
      .order('activity_date', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getById(
    portfolioId: string,
    activityId: string,
  ): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('id', activityId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async create(
    portfolioId: string,
    input: ActivityWriteInput,
  ): Promise<Activity> {
    const userId = await getCurrentUserId()
    const publishing = withPublishAt(input)

    if (publishing.status === 'published') {
      const missing = getMissingPublishFields(input)
      if (missing.length > 0) {
        throw new Error(
          `Cannot publish until these fields are filled: ${missing.join(', ')}`,
        )
      }
    }
    if (publishing.status === 'scheduled') {
      const missing = getMissingPublishFields(input)
      if (missing.length > 0) {
        throw new Error(
          `Cannot schedule until these fields are filled: ${missing.join(', ')}`,
        )
      }
      if (!publishing.publish_at) {
        throw new Error('Publish time is required to schedule an activity.')
      }
    }

    let slug = await allocateUniqueSlug(
      portfolioId,
      input.title_en,
      input.title_hi,
    )

    const activityDate = input.activity_date?.trim() || localDateYmd()

    const payload: ActivityInsert = {
      portfolio_id: portfolioId,
      slug,
      title_en: input.title_en,
      title_hi: input.title_hi,
      description_en: input.description_en,
      description_hi: input.description_hi,
      location_en: input.location_en,
      location_hi: input.location_hi,
      activity_date: activityDate,
      display_date: input.display_date?.trim() || activityDate,
      status: publishing.status,
      publish_at: publishing.publish_at,
      is_featured: input.is_featured,
      sort_order: input.sort_order,
      created_by: userId,
    }

    for (let attempt = 0; attempt < SLUG_INSERT_RETRIES; attempt += 1) {
      payload.slug = slug
      const { data, error } = await supabase
        .from('activities')
        .insert(payload)
        .select('*')
        .single()

      if (!error) return data

      if (!isUniqueViolation(error) || attempt === SLUG_INSERT_RETRIES - 1) {
        throw error
      }

      slug = await allocateUniqueSlug(
        portfolioId,
        input.title_en,
        input.title_hi,
        true,
      )
    }

    throw new Error('Could not generate a unique slug. Please try again.')
  },

  async update(
    portfolioId: string,
    activityId: string,
    input: ActivityWriteInput,
  ): Promise<Activity> {
    const userId = await getCurrentUserId()
    const publishing = withPublishAt(input)

    if (publishing.status === 'published') {
      assertCanPublish({
        ...(await getScoped(portfolioId, activityId)),
        ...input,
        status: publishing.status,
        publish_at: publishing.publish_at,
      })
    }
    if (publishing.status === 'scheduled') {
      assertCanSchedule(
        {
          ...(await getScoped(portfolioId, activityId)),
          ...input,
          status: publishing.status,
          publish_at: publishing.publish_at,
        },
        publishing.publish_at ?? '',
      )
    }

    const payload: ActivityUpdate = {
      slug: input.slug,
      title_en: input.title_en,
      title_hi: input.title_hi,
      description_en: input.description_en,
      description_hi: input.description_hi,
      location_en: input.location_en,
      location_hi: input.location_hi,
      activity_date: input.activity_date,
      display_date: input.display_date,
      status: publishing.status,
      publish_at: publishing.publish_at,
      is_featured: input.is_featured,
      sort_order: input.sort_order,
      updated_by: userId,
    }

    const { data, error } = await supabase
      .from('activities')
      .update(payload)
      .eq('portfolio_id', portfolioId)
      .eq('id', activityId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async softDelete(portfolioId: string, activityId: string): Promise<Activity> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('activities')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('portfolio_id', portfolioId)
      .eq('id', activityId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async restore(portfolioId: string, activityId: string): Promise<Activity> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('activities')
      .update({
        deleted_at: null,
        updated_by: userId,
      })
      .eq('portfolio_id', portfolioId)
      .eq('id', activityId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async publish(portfolioId: string, activityId: string): Promise<Activity> {
    const current = await getScoped(portfolioId, activityId)
    assertCanPublish(current)
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('activities')
      .update({
        status: 'published',
        publish_at: current.publish_at ?? new Date().toISOString(),
        updated_by: userId,
      })
      .eq('portfolio_id', portfolioId)
      .eq('id', activityId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async schedule(
    portfolioId: string,
    activityId: string,
    publishAt: string,
  ): Promise<Activity> {
    const current = await getScoped(portfolioId, activityId)
    assertCanSchedule(current, publishAt)
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('activities')
      .update({
        status: 'scheduled',
        publish_at: publishAt,
        updated_by: userId,
      })
      .eq('portfolio_id', portfolioId)
      .eq('id', activityId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async archive(portfolioId: string, activityId: string): Promise<Activity> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('activities')
      .update({
        status: 'archived',
        updated_by: userId,
      })
      .eq('portfolio_id', portfolioId)
      .eq('id', activityId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  async updateSortOrder(
    portfolioId: string,
    activityId: string,
    sortOrder: number,
  ): Promise<Activity> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('activities')
      .update({
        sort_order: sortOrder,
        updated_by: userId,
      })
      .eq('portfolio_id', portfolioId)
      .eq('id', activityId)
      .select('*')
      .single()

    if (error) throw error
    return data
  },
}
