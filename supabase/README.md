# Supabase Backend

Backend for the Portfolio CMS (Phase 3: approved schema implementation). See
the project's architecture discussion for the full design rationale — this
file only documents how to work with what's here.

## Folders

- `migrations/` — versioned schema history, the only source of truth for the
  database structure. Applied in filename (timestamp) order.
- `seed.sql` — local-development-only fixtures (one obviously-fake
  "Test Portfolio"). Never applied to production.
- `types/` — generated `database.types.ts` lands here (see below). Not
  hand-edited.
- `functions/` — Edge Functions. Empty in V1: unsigned Cloudinary uploads
  need no signing endpoint, and the scheduled-activity auto-publish job is
  implemented as `pg_cron` SQL, not an Edge Function. See
  `functions/README.md`.
- `storage/` — documents that Supabase Storage buckets are **not** used in
  V1 (Cloudinary is the media store). See `storage/README.md`.
- `policies/` — human-readable RLS reference, one file per table. This is
  documentation only; the actual policy SQL lives inside each table's
  migration.

## Local development

Requires the Supabase CLI and Docker Desktop (for the local Postgres/Auth/
Storage/Studio stack).

```
supabase start                 # boot the local stack
supabase migration new <name>  # scaffold a new timestamped migration file
supabase db reset              # replay all migrations + seed.sql from scratch
supabase gen types typescript --local > supabase/types/database.types.ts
```

## Production deployment

Schema changes reach the hosted project only via
`supabase link --project-ref <ref>` followed by `supabase db push`, ideally
run from CI, never hand-applied through the Supabase Dashboard SQL editor.
After a push, regenerate types against the linked project:

```
supabase gen types typescript --linked > supabase/types/database.types.ts
```

## Status of this implementation (Phase 3)

Every migration file in `migrations/` was hand-written and has **not** been
applied to any database, local or hosted — this machine has no Docker
runtime and this project is not linked to a Supabase project. See the
Phase 3 implementation report for exactly what was and wasn't verified, and
what's required before these migrations can be applied.
