import { getErrorMessage, isUniqueViolation } from '@/shared/utils'

export function getFriendlyActivityError(error: unknown): string {
  if (isUniqueViolation(error)) {
    return 'Could not generate a unique slug. Please try again.'
  }
  const message = getErrorMessage(error)
  if (
    message.toLowerCase().includes('required') ||
    message.toLowerCase().includes('cannot publish') ||
    message.toLowerCase().includes('cannot schedule') ||
    message.toLowerCase().includes('unique slug')
  ) {
    return message
  }
  return message || 'Activity could not be created. Please check the required fields.'
}

export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}
