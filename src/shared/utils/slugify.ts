/**
 * Converts a string into a URL-safe slug. Latin text is lowercased and
 * hyphenated; non-Latin scripts (e.g. Devanagari) are preserved so Hindi
 * titles still produce a usable slug rather than an empty string.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
