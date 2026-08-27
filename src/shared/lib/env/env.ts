import { z } from 'zod'

/**
 * Validates the required Vite environment variables at application startup.
 * Throws a single, readable error listing every problem so a misconfigured
 * environment fails loudly and immediately instead of surfacing as a vague
 * runtime error deep in the app.
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'VITE_SUPABASE_PUBLISHABLE_KEY is required'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  throw new Error(
    `Invalid or missing environment variables:\n${issues}\n\n` +
      'Create a .env.local file at the project root (see .env.example).',
  )
}

export const env = parsed.data
