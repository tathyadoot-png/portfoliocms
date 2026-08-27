# Generated Types

`database.types.ts` belongs here once generated. It was **not** generated
during Phase 3 because that command requires either a running local
Supabase stack (`--local`, needs Docker) or a linked hosted project
(`--linked`, needs `supabase link` + a project ref/access token) — neither
was available in this environment. See the Phase 3 implementation report.

Once generated, the frontend's `shared/lib/supabase/` should import this
file directly rather than maintaining a second copy, so there is exactly
one generated-types file in the repo.
