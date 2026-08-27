import type { ApiError } from '@/shared/types'

interface SupabaseLikeError {
  message?: string
  code?: string
  details?: string
}

/**
 * Normalizes any thrown value (Supabase PostgrestError, Error, or unknown)
 * into a consistent ApiError the UI can render.
 */
export function normalizeError(error: unknown): ApiError {
  if (error && typeof error === 'object') {
    const e = error as SupabaseLikeError
    if (typeof e.message === 'string') {
      return { message: e.message, code: e.code, details: e.details }
    }
  }
  if (typeof error === 'string') {
    return { message: error }
  }
  return { message: 'An unexpected error occurred.' }
}

/** Convenience for surfacing an error message string directly. */
export function getErrorMessage(error: unknown): string {
  return normalizeError(error).message
}

/** Postgres unique-violation (e.g. duplicate slug). */
export function isUniqueViolation(error: unknown): boolean {
  return normalizeError(error).code === '23505'
}
