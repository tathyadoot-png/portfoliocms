import type { ActivityStatus } from '../types'

export { activityKeys } from './queryKeys'

export const ACTIVITY_STATUSES: readonly ActivityStatus[] = [
  'draft',
  'scheduled',
  'published',
  'archived',
]
