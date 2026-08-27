import { getErrorMessage, isUniqueViolation } from '@/shared/utils'

export function getFriendlyActivityError(error: unknown): string {
  if (isUniqueViolation(error)) {
    return 'This slug is already used by another activity in this portfolio. Choose a different slug.'
  }
  return getErrorMessage(error)
}

export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}
