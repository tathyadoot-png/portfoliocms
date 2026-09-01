# Portfolio CMS — Project Context

**Read this file first, before touching any code.** It is the single source of truth for what this project is, why it's built the way it is, what's actually implemented (as opposed to planned), and what must not be changed without an explicit architectural decision.

If this file and the code ever disagree, **the code is correct** — flag the discrepancy and fix this file, don't assume the file is right.

---

## 1. What this project is

**Portfolio CMS** is an internal, admin-only content management system used to manage the data behind multiple politicians' public portfolio websites.

- This repository is **the CMS only** — it is not, and does not replace, any public-facing website.
- Public portfolio websites are **separate repositories** with their own independent UI/design. They are not part of this codebase and this codebase does not generate or serve them.
- Four portfolio websites are currently planned to be backed by this CMS:
  1. Sampatiya Uikey
  2. Bhupendra Singh
  3. Rajendra Shukla
  4. Ganesh Singh
- Data flow (current and intended):

  ```
  CMS (this repo)  →  Supabase (shared database)  →  Each public portfolio website (separate repo, own UI)
  ```

  Each public website will eventually read its own portfolio's data from the same Supabase project, scoped by `portfolio_id`. Building or modifying those public websites is **out of scope** for this repository.

## 2. Multi-portfolio model — core architectural principle

One CMS instance manages **all** portfolios. This is deliberate and must not be undone:

- Every portfolio-owned resource (activities, media, settings, Cloudinary config) is isolated by a `portfolio_id` foreign key.
- The CMS is **not** duplicated per politician. There is one `activities` feature, one `media` feature, etc. — each parameterized by the active portfolio, not copy-pasted per portfolio.
- The **URL** is the source of truth for which portfolio is active — not React Context, not global state:
  ```
  /portfolios/:portfolioId/activities
  /portfolios/:portfolioId/media
  /portfolios/:portfolioId/settings/cloudinary
  ```
- A query for Portfolio A's data must never be able to return Portfolio B's data. Every TanStack Query key for portfolio-scoped data embeds `portfolioId`, and every service function takes `portfolioId` as an explicit parameter — never inferred from ambient/global state.

**Do not** build a second Activities (or any other) implementation for a different politician. **Do not** introduce a global/shared Cloudinary account — see §7.

## 3. Tech stack (as actually installed — see `package.json`)

- **React 19**, **Vite 8**, **TypeScript ~6.0** (strict mode, `noUnusedLocals`/`noUnusedParameters` on)
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — design tokens defined in `src/index.css` using `@theme`
- UI primitives are **hand-built, shadcn-API-compatible components** in `src/shared/components/ui` (Button, Input, Textarea, Label, Card, Spinner) using `class-variance-authority` + `clsx` + `tailwind-merge`. The shadcn CLI/registry itself is **not** wired up — these were written to be a drop-in-compatible foundation, not generated.
- **React Router DOM v7** (`createBrowserRouter`, data router)
- **Supabase JS v2** (`@supabase/supabase-js`) + **Supabase Auth** (email/password)
- **TanStack Query v5** (`@tanstack/react-query`) for all server state
- **React Hook Form v7** + **`@hookform/resolvers`** + **Zod v4** for all forms/validation
- **Cloudinary** — no SDK dependency; a small hand-written unsigned-upload client (`src/shared/lib/cloudinary`) using `XMLHttpRequest` directly (chosen specifically to get real upload-progress events)
- **lucide-react** for icons, **react-hot-toast** for toasts
- **ESLint 10** + `typescript-eslint` (flat config, `eslint.config.js`)
- No Redux, no Zustand, no other state library — confirmed absent from `package.json`.

## 4. Architecture — feature-based

```
src/
  app/
    providers/     # AppProviders (QueryClientProvider + AuthProvider + Toaster)
    layouts/        # RootLayout, AuthLayout, ProtectedLayout, DashboardLayout, PortfolioLayout
    routes/         # router.tsx (route tree), NotFoundPage, UnauthorizedPage
  features/
    auth/            # Supabase Auth: session, login, sign-out
    portfolios/       # The portfolio (tenant) entity itself: CRUD, switcher, active-portfolio resolution
    profile/          # Portfolio Profile editor + Portfolio Settings + favicon (screens, not new tables)
    activities/        # Full CRUD: bilingual content, lifecycle, cover + gallery
    media/             # Shared `media` table: role-based images, uploader wiring, library UI
    social-links/       # Full CRUD: platform/url/visibility, sort_order, hard delete
    seo/                # STUB ONLY, and intentionally not being built further — see §11
    cloudinary-settings/ # Per-portfolio Cloudinary config (cloud_name/upload_preset/default_folder)
    account/            # Current user's own account screen
  shared/
    components/
      ui/            # Hand-built shadcn-compatible primitives
      layout/         # PageHeader, SidebarNav, TabNav, Topbar
      feedback/        # FullPageLoader, LoadingState, ErrorState, EmptyState
      form/            # FormField (label + control + error wrapper)
      media/           # CloudinaryImage (display-only), ImageUploader (feature-agnostic upload widget)
    hooks/            # useDebounce
    lib/
      env/             # Zod-validated import.meta.env wrapper
      supabase/         # Single typed Supabase client + Database type re-exports
      cloudinary/        # createCloudinaryUploader() factory, buildCloudinaryUrl()
      query-client.ts   # Shared QueryClient (refetchOnWindowFocus: false, tiered staleTime)
    types/            # ApiError, PaginatedResult<T>, ID, SortOrder, ListParams
    constants/         # ROUTES path-builder, STALE_TIME presets, DEFAULT_PAGE_SIZE
    utils/             # cn, slugify, normalizeError/getErrorMessage
    validation/         # slugSchema, urlSchema, optionalUrlSchema, requiredString
```

### Non-negotiable architectural rules (enforced throughout the existing code)

- **Supabase calls live only inside a feature's `services/*.ts`.** Components and hooks never import `supabase` directly.
- **Hooks consume services**, wrapping them in TanStack Query (`useQuery`/`useMutation`). Hooks are the only thing components call for server state.
- **Every feature exposes a single public surface: `features/<name>/index.ts`.** Other features (and `app/`) may only import from that barrel — never from another feature's internal `components/`, `services/`, etc. (Verified pattern: `features/profile` imports `RoleImageManager` from `@/features/media`, `useCloudinaryConfigQuery` from `@/features/cloudinary-settings`, and `useUpdatePortfolioMutation` from `@/features/portfolios` — all via their `index.ts`.)
- **Domain types are derived from the generated Supabase `Database` type**, never hand-duplicated (`Tables<'x'>`, `TablesInsert<'x'>`, `TablesUpdate<'x'>`, `Enums<'x'>` helpers in `shared/lib/supabase/types.ts`).
- **Forms use React Hook Form + `zodResolver`.** Validation schemas live in each feature's `validation/` folder.
- **TanStack Query is the only server-state mechanism.** React Context is used sparingly, only for genuinely cross-cutting client state: `AuthContext` (session) and `ActivePortfolioContext` (the resolved active portfolio, provided by `PortfolioLayout`).
- **Query keys for portfolio-scoped resources always embed `portfolioId`** (e.g. `mediaKeys.list(portfolioId, filters)`, `cloudinaryKeys.detail(portfolioId)`, `portfolioSettingsKeys.detail(portfolioId)`). This is what guarantees switching portfolios can never leak cached data from another portfolio.

## 5. Authentication

- **Supabase Auth, email/password only.** No sign-up UI exists in the CMS — admin users are provisioned directly in the Supabase dashboard.
- No RBAC. Any authenticated user currently has full CMS access, governed entirely by the RLS policies described in §8 (`authenticated` role = full read/write, `anon` = no access).
- Flow: `AuthProvider` (`features/auth/providers/AuthProvider.tsx`) resolves the initial session, subscribes to `onAuthStateChange`, and exposes `useAuth()`. `ProtectedLayout` blocks rendering until the initial session resolves, then redirects unauthenticated users to `/login` (remembering the intended destination).
- **Login has been manually verified working** against the live Supabase project (see §14) after a prior environment-configuration bug (wrong project URL/key in `.env.local`) was diagnosed and fixed.
- Never document, log, or commit actual credentials, tokens, or keys — this file intentionally contains none.

## 6. Supabase

- Project ref: `ymxpboccinislragdrnz`. This is not a secret; the anon/publishable key and DB password are, and are never recorded here.
- Frontend uses the **publishable (anon) key only**, via a single typed client: `src/shared/lib/supabase/client.ts` → `createClient<Database>(url, publishableKey)`. There is exactly one Supabase client instance in the app.
- The **`service_role` key must never appear in frontend code** — no exceptions, no future features should introduce it without a full architectural review.
- Schema is **migration-based** (`supabase/migrations/`) — migrations are the sole source of truth for schema history. Thirteen migrations exist today (`20260817120001` through `20260817120010`, plus GRANT-only `20260825120011` / `20260825180012`, plus `20260826120013` which adds anon schema USAGE, SELECT grants, and narrow public-read RLS — no table/column/enum changes).
- Generated types live at `supabase/types/database.types.ts` (UTF-16 encoded, as produced by the Supabase CLI) and are consumed **type-only** via a `@db` path alias — this file is never hand-edited and was not regenerated by any phase since Phase 4 (no schema changes have occurred that would require it).

## 7. Cloudinary strategy — critical, do not violate

- **Every portfolio has its own, separate Cloudinary account.** There is no global/shared Cloudinary account anywhere in this system, and none should ever be introduced.
- Configuration is stored per portfolio in the `cloudinary_configs` table (1:1 with `portfolios`), holding only:
  - `cloud_name`
  - `upload_preset`
  - `default_folder` (optional)
- **V1 uses unsigned, direct browser-to-Cloudinary uploads exclusively.** There is no API key, no API secret, no signed-upload flow, and no server-side upload proxy or Edge Function anywhere in this codebase — and none should be added without an explicit, separate architectural decision.
- The uploader is a small factory, `createCloudinaryUploader(config)` in `shared/lib/cloudinary/createCloudinaryUploader.ts`, instantiated on demand with whichever portfolio's config is active — never a singleton, never hardcoded credentials. It is wrapped by the reusable `ImageUploader` component (`shared/components/media/ImageUploader.tsx`), which is feature-agnostic and does **not** talk to Supabase — it only reports the raw Cloudinary result upward via callbacks.
- Resolving "which Cloudinary account" always goes through `portfolioId` → `cloudinary_configs` lookup (`useCloudinaryConfigQuery(portfolioId)` in `features/cloudinary-settings`) — never assumed or cached globally.

## 8. Database (deployed, migration-based, do not modify without explicit approval)

Seven tables exist, all created by the migrations in `supabase/migrations/`:

| Table | Purpose | Relationship |
|---|---|---|
| `portfolios` | The politician entity: bilingual name/designation/about, `slug`, `status` (`active`/`inactive`), `theme` (free text, validated at the app layer against a maintained list — deliberately not a DB enum), `created_by`/`updated_by` | Root entity |
| `cloudinary_configs` | Per-portfolio Cloudinary binding (see §7) | 1:1 with `portfolios`, `ON DELETE CASCADE` |
| `seo_meta` | Per-portfolio SEO metadata (bilingual meta title/description, keywords, canonical URL, OG image reference) | 1:1 with `portfolios`; **exists in the DB but has no CMS UI — see §11** |
| `social_links` | Ordered list of social/external links per portfolio | 1:many with `portfolios`; CMS CRUD implemented in Phase 7 |
| `portfolio_settings` | Contact/address/copyright/favicon reference, optional 1:1 row (row presence = configured) | 1:1 with `portfolios`, `ON DELETE CASCADE`; `favicon_media_id` → `media.id` |
| `activities` | The shared content entity — see full field list in §9 | Many:1 with `portfolios`, `ON DELETE CASCADE`; CMS CRUD implemented in Phase 6 |
| `media` | The single unified table for every uploaded asset — portfolio profile/cover/favicon images AND activity cover/gallery images. No `activity_images`/`profile_images`/`cover_images`/`favicon_images` tables exist or should be created. | `portfolio_id` always set (`ON DELETE CASCADE`); `activity_id` nullable (`ON DELETE CASCADE`) — exclusive-arc ownership enforced by a `media_ownership_check` CHECK constraint, not a polymorphic `entity_type`/`entity_id` pattern |

### Cross-cutting DB conventions

- UUID primary keys via `gen_random_uuid()`.
- `created_at`/`updated_at` timestamptz on every table; `updated_at` is maintained by a shared `set_updated_at()` trigger — **application code must never set `updated_at` manually.**
- `created_by`/`updated_by` (nullable, `references auth.users(id) on delete set null`) exist on `portfolios` and `activities` — set from `supabase.auth.getUser()` in the service layer on create/update respectively, never hardcoded.
- **Soft delete** via nullable `deleted_at` on `portfolios`, `activities`, and `media` — application code must never issue a hard `DELETE` on these tables. Config-like tables (`cloudinary_configs`, `seo_meta`, `social_links`, `portfolio_settings`) do not have soft delete and cascade-delete with their parent portfolio.
- Slug uniqueness: `portfolios.slug` is globally unique (partial unique index, active rows only); `activities(portfolio_id, slug)` is unique **per portfolio**, not globally — both partial indexes exclude soft-deleted rows so a slug frees up after deletion.
- `media` role-based ownership: `role` ∈ `profile | cover | gallery | favicon`; `profile`/`favicon` require `activity_id IS NULL` (portfolio-level only), `gallery` requires `activity_id IS NOT NULL` (activity-level only), `cover` is valid at either level — enforced by the `media_ownership_check` CHECK constraint.
- `media.kind` ∈ `image | video | document` (only `image` is used by any current UI).
- **RLS is enabled on all seven tables.** Current policy on every table: `authenticated` role has full read/write (`FOR ALL USING (true) WITH CHECK (true)`); `anon` has no policy and is therefore denied by default. This is the actual security boundary — client-side route guards are UX only. No RBAC-scoped policies exist.
- **Table GRANTs are also required.** New Supabase projects do not auto-expose `public` tables to Data API roles. `authenticated` has `SELECT/INSERT/UPDATE/DELETE` on the implemented CMS tables (`portfolios`, `activities`, `media`, `cloudinary_configs`, `portfolio_settings`, `social_links`). `anon` has **schema USAGE** plus **SELECT-only** on `portfolios`, `activities`, and `media` (migration `20260826120013`), plus narrow RLS — not `USING (true)`. `seo_meta` / `social_links` / `cloudinary_configs` / `portfolio_settings` stay un-granted to anon. RLS policies are never evaluated if the GRANT is missing (PostgREST 403: `permission denied for table …` or `schema public`).

### Activities table — full approved field list

```
id, portfolio_id, slug,
title_en, title_hi, description_en, description_hi,
location_en, location_hi,
activity_date, display_date,
status (draft | scheduled | published | archived),
publish_at,
is_featured, sort_order,
created_by, updated_by, created_at, updated_at, deleted_at
```

**Critical rule:** `activity_date` is the sole field used for chronological sorting/filtering. `display_date` is a free-form, human-readable string (e.g. "24 जुलाई 2026", "Monsoon Session 2026") for display only — **it must never be used for database ordering.** An index already exists supporting `(portfolio_id, activity_date DESC)` and a partial index on `(status, publish_at) WHERE status = 'scheduled'` for a future auto-publish job (no such job is implemented yet — see §9).

## 9. Current implementation status by feature

| Area | Status | Notes |
|---|---|---|
| Architecture & Cloudinary strategy (Phase 1) | ✅ Complete | Design-only phase, approved |
| Database architecture/design (Phase 2, 2.9) | ✅ Complete | Design-only phases, approved |
| Database migrations (Phase 3, 3B) | ✅ Complete | 10 migrations applied to the hosted project; schema frozen |
| CMS foundation — auth, portfolios, routing, layouts, Supabase client (Phase 4) | ✅ Complete | Login manually verified working |
| Portfolio Profile, Portfolio Settings, Cloudinary Settings, Media foundation (Phase 5) | ✅ Complete | Typecheck/lint/build all passing at time of completion |
| **Activities** | ✅ **Implemented (Phase 6)** | Full CMS: list/search/filter/sort, bilingual create/edit, draft/scheduled/published/archived, cover + gallery on the shared `media` table, soft delete/restore, portfolio isolation via `portfolioId` in every query and query key. |
| **Social Links** | ✅ **Implemented (Phase 7)** | Full CMS CRUD on existing `social_links`: platform enum, URL, optional custom label for `other`, visibility, `sort_order` up/down, hard delete with confirm. Portfolio-scoped service/query keys. |
| **SEO** | ❌ **NOT implemented, and intentionally not scheduled** | `features/seo` contains only a stub `SeoPage`. The `seo_meta` table exists in the DB for future use, but no SEO UI/workflow is currently planned — see §11. |

SEO remains intentionally unimplemented. Social Links are not bilingual (URLs only). Activities reuse the existing `media` table for cover/gallery.

## 10. Bilingual strategy

- The CMS — and the public sites it feeds — supports **exactly two languages: English and Hindi.** This is a deliberate, fixed V1 scope, not a generic i18n system.
- Bilingual fields consistently use an `_en`/`_hi` suffix pattern (`title_en`/`title_hi`, `about_en`/`about_hi`, `alt_text_en`/`alt_text_hi`, etc.) across `portfolios`, `activities`, `media`, `seo_meta`, and `portfolio_settings`.
- **All bilingual content is entered manually by the content team.** No AI translation, no Google Translate, no OpenAI translation, no third-party translation API, and no server-side translation step exists or should be added at any point in V1.

## 11. What is intentionally NOT being built right now

- **SEO UI/workflow** — the `seo_meta` table exists and is left untouched for possible future use, but no SEO pages, forms, hooks, or UI should be built as part of the current CMS scope. This is a deliberate scope decision (internal CMS, not currently required), not an oversight.
- **RBAC / multi-admin permissions** — `created_by`/`updated_by` audit columns exist as forward-compatible hooks, but no roles/permissions system exists or should be added without an explicit decision. Current model: any authenticated user has full access.
- **Categories/tags for activities** — not in the current schema or plan; would be additive tables if ever needed.
- **Signed Cloudinary uploads / server-side upload proxy / Edge Functions** — V1 is unsigned direct uploads only; do not introduce a server component to "improve" this without a separate decision.
- **AI/automatic translation** — see §10; explicitly out of scope, repeatedly re-confirmed across every phase.
- **The public portfolio websites' UI** — out of scope for this repository entirely (see §1).
- **A public-facing/anon-readable API** — Phase 9 blocker fix grants `anon` **SELECT-only** on `portfolios`, `activities`, and `media`, with narrow RLS (active portfolios; published non-deleted activities; media of that public content). `anon` still cannot INSERT/UPDATE/DELETE, and cannot read `social_links`, `cloudinary_configs`, `portfolio_settings`, or `seo_meta`. Public website UI remains a separate repository.

## 12. Environment configuration

Two Vite env vars are required (see `.env.example` at the repo root — names only, no values are ever recorded in this file or `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Rules:
- `.env.local` is git-ignored (`*.local` in `.gitignore`) and must never be committed.
- Env vars are validated at startup via Zod (`src/shared/lib/env/env.ts`) — the app throws a clear, immediate error listing exactly what's missing/invalid rather than failing silently later.
- The `service_role` key and any Cloudinary API secret must never be placed in any `VITE_*` variable or anywhere in frontend code — V1 has no legitimate use for either.

## 13. Manual actions / operational notes

- **MANUAL ACTION REQUIRED (per portfolio, ongoing):** for every portfolio, an operator must enter that portfolio's own real Cloudinary `cloud_name`, an **unsigned** `upload_preset`, and optionally a `default_folder` via the CMS's Cloudinary Settings screen (`/portfolios/:portfolioId/settings/cloudinary`) before that portfolio's image uploads (profile/cover/favicon, and activity cover/gallery) will function. This cannot be done by code — it depends on each portfolio's actual external Cloudinary account.
- **MANUAL ACTION (already resolved once, documented for awareness):** a prior session found `.env.local` pointing at an unreachable/incorrect Supabase project and an API key from a different project; this was diagnosed via live network probes and corrected. If login ever again fails with a network error or "Invalid API key", re-verify `.env.local` against the actual linked project (`ymxpboccinislragdrnz`) before assuming an application bug.
- **Real politician activity content** will be entered by the content team only after the Activities CMS feature is actually built and working. Do not insert real politician data as seed/dev data at any point. Any local dev seed data (`supabase/seed.sql`) must remain obviously fake/dev-only (it currently uses a "Test Portfolio (Dev Fixture)" row) and is never applied to production (`supabase db push` does not run `seed.sql`).

## 14. Verification history (accurate as of the last completed work, Phase 7 + anon public-read)

- `npx tsc -b --noEmit` → pass
- `npm run lint` (ESLint flat config) → pass
- `npm run build` (`tsc -b && vite build`) → pass (pre-existing, non-blocking warning: JS bundle > 500 kB)
- Anon PostgREST SELECT `portfolios` succeeds (1 active row); INSERT denied.
- Anon SQL filter test (rolled back): draft/scheduled/archived/deleted/inactive-portfolio activities = 0; published = 1; public media covers visible; draft/deleted media = 0.
- Authenticated still SELECTs CMS tables including social_links / cloudinary_configs / portfolio_settings.

## 15. Planned phase order going forward

1. **Phase 6 — Activities** ✅ complete.
2. **Phase 7 — Social Links** ✅ complete.
3. **Phase 8 — CMS polish / production hardening**, scope to be defined as needed (e.g. code-splitting, error boundaries, accessibility passes).
4. SEO UI: not scheduled; revisit only if a concrete requirement emerges.
5. RBAC, categories/tags, video/document media kinds, signed uploads: future-only, each requires its own explicit architectural decision before implementation — do not start any of these speculatively.

## 16. Ground rules for whoever (human or AI) works on this next

1. Read this file first. Then inspect the actual current repository state before changing anything — this file is a snapshot, the code is the ground truth if they ever diverge.
2. Do not rebuild features that are already complete (§9) — extend them through their public `index.ts`, don't reopen their internals.
3. Do not assume a stub page (SEO) is further along than "renders an EmptyState" — verify by reading the actual files. Social Links is implemented.
4. Do not create migrations, alter tables, change enums, or touch RLS without a specific, explicit decision to do so — the schema is frozen and approved.
5. Do not introduce a second Cloudinary account model, a second media table, a second uploader, Redux/Zustand, RBAC, or AI translation — these have been explicitly and repeatedly ruled out across every phase.
6. Keep this file updated after each significant phase: what shipped, what decisions were made and why, what's now the accurate status of every feature.
7. Proceed autonomously through routine implementation decisions; stop and clearly flag `MANUAL ACTION REQUIRED` only for genuinely consequential or irreversible actions (schema changes, destructive operations, missing secrets, major architecture calls).
