/** Shared staleTime presets (ms) so cache behavior is consistent per feature. */
export const STALE_TIME = {
  short: 30_000,
  medium: 5 * 60_000,
  long: 30 * 60_000,
} as const

export const DEFAULT_PAGE_SIZE = 20
