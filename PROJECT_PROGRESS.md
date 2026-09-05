# Portfolio CMS — Project Progress

Living implementation history. If this file and the code disagree, **the code is correct**.

---

## Current state

**Phase 7 (Social Links CRUD) is complete.** Activity create/edit uses one unified image picker (Cover is a selection, not a separate uploader). Anon public-read is in place. Sampatiya website integration remains a separate repo.

Next planned work: Sampatiya Activities integration (separate repo). CMS Phase 8 polish remains unscheduled.

---

## Completed phases

| Phase | What shipped |
|---|---|
| 1 | Architecture & Cloudinary strategy (design) |
| 2 / 2.9 | Database architecture (design) |
| 3 / 3B | 10 migrations applied; schema frozen |
| 4 | CMS foundation: auth, portfolios, routing, layouts, Supabase client |
| 5 | Portfolio Profile, Settings, Cloudinary Settings, Media foundation |
| **6** | **Activities CMS** |
| **7** | **Social Links CRUD** |
| **9 blocker** | **Anon public SELECT on portfolios/activities/media** |

---

## Phase 6 — Activities CMS

### Features implemented

- Routes:
  - `/portfolios/:portfolioId/activities`
  - `/portfolios/:portfolioId/activities/new`
  - `/portfolios/:portfolioId/activities/:activityId`
- List with title, status, activity date, display date, location, featured, updated date, cover thumbnail, actions
- Search (debounced) on `title_en`, `title_hi`, `slug`, `location_en`, `location_hi`
- Filters: status, featured, activity-date range, include-deleted
- Default sort: `activity_date DESC` (never `display_date`)
- Create + edit form sections: Basic, English, Hindi, Date & Location, Publishing, Media, Additional
- Draft / scheduled / published / archived lifecycle
- Cover image (`media.role = cover`, `activity_id` set)
- Gallery (`media.role = gallery`) with preview, metadata, soft delete/restore, up/down reorder persisted as `sort_order`
- Soft delete via `deleted_at`; restore; never a hard delete of activities or Cloudinary assets
- After create: banner with View / Edit / Create another

### Important decisions

- No schema/migration/RLS changes. Existing `activities` + `media` tables only.
- Media for activities lives in the **media feature** (service + hooks exported from `features/media/index.ts`). Activities never call Supabase for media rows.
- Cover replacement: insert new row, then soft-delete previous cover. Cloudinary assets are never destroyed.
- Gallery reorder is up/down buttons, not drag-and-drop.
- Cover/gallery uploads require an activity id, so media UI is on the edit screen. Create form explains this.
- Publish/schedule is validated in Zod (form) and again in `activitiesService` (list actions). Missing fields are listed in the UI.
- No browser-side auto-publish job and no Edge Function.
- Slug uniqueness is per `(portfolio_id, slug)` (partial unique index excluding deleted rows). Duplicate slug → friendly message via Postgres `23505`.
- `created_by` / `updated_by` come from `supabase.auth.getUser()`. `updated_at` is left to the DB trigger.
- Query keys always embed `portfolioId`. Mutations invalidate only that portfolio’s namespace.

### Files created

**Activities feature**

- `src/features/activities/types/index.ts`
- `src/features/activities/constants/queryKeys.ts`
- `src/features/activities/constants/index.ts`
- `src/features/activities/validation/activitySchema.ts`
- `src/features/activities/services/activitiesService.ts`
- `src/features/activities/utils/datetime.ts`
- `src/features/activities/utils/errors.ts`
- `src/features/activities/utils/form.ts`
- `src/features/activities/hooks/useActivitiesQuery.ts`
- `src/features/activities/hooks/useActivityQuery.ts`
- `src/features/activities/hooks/useCreateActivityMutation.ts`
- `src/features/activities/hooks/useUpdateActivityMutation.ts`
- `src/features/activities/hooks/useSoftDeleteActivityMutation.ts`
- `src/features/activities/hooks/useRestoreActivityMutation.ts`
- `src/features/activities/hooks/usePublishActivityMutation.ts`
- `src/features/activities/hooks/useScheduleActivityMutation.ts`
- `src/features/activities/hooks/useArchiveActivityMutation.ts`
- `src/features/activities/components/ActivityStatusBadge.tsx`
- `src/features/activities/components/ActivityForm.tsx`
- `src/features/activities/components/ActivityCard.tsx`
- `src/features/activities/components/ActivityCoverManager.tsx`
- `src/features/activities/components/ActivityGalleryManager.tsx`
- `src/features/activities/pages/ActivityEditPage.tsx`
- `PROJECT_PROGRESS.md` (this file; was missing)

**Media extensions**

- `src/features/media/hooks/useActivityCoverQuery.ts`
- `src/features/media/hooks/useActivityCoversQuery.ts`
- `src/features/media/hooks/useActivityGalleryQuery.ts`
- `src/features/media/hooks/useReplaceActivityCoverMutation.ts`
- `src/features/media/hooks/useAddActivityGalleryImageMutation.ts`
- `src/features/media/hooks/useReorderActivityGalleryMutation.ts`

**Shared**

- `src/shared/components/feedback/ConfirmDialog.tsx`

### Files modified

- `src/features/activities/index.ts`
- `src/features/activities/pages/ActivitiesPage.tsx`
- `src/features/activities/pages/ActivityCreatePage.tsx`
- `src/features/media/index.ts`
- `src/features/media/types/index.ts`
- `src/features/media/constants/queryKeys.ts`
- `src/features/media/services/mediaService.ts`
- `src/shared/components/media/ImageUploader.tsx` (`multiple` uploads)
- `src/shared/components/feedback/index.ts`
- `src/shared/constants/routes.ts`
- `src/shared/utils/error.ts` (`isUniqueViolation`)
- `src/shared/utils/index.ts`
- `src/app/routes/router.tsx`
- `PROJECT_CONTEXT.md`

### Validation rules

Base schema (`activityFormSchema`):

- `title_en` / `title_hi` required (max 200)
- `slug` via shared `slugSchema`
- descriptions max 10000; locations max 200; display_date max 120
- drafts may omit descriptions and `activity_date`
- **published** or **scheduled** require: `title_en`, `title_hi`, `description_en`, `description_hi`, `activity_date`
- **scheduled** also requires `publish_at`
- `sort_order` integer 0–999999; `is_featured` boolean

### Database integration

- Reads/writes `public.activities` only through `activitiesService`, always filtered by `portfolio_id`
- Activity media uses `public.media` through `mediaService`
- No migrations, no new tables/columns/enums, no RLS changes
- Soft delete: `deleted_at`. Default list excludes deleted rows

### Testing results

- `npx tsc -b --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — pass (existing >500 kB bundle warning, not introduced by this phase)

### Manual actions

- **MANUAL ACTION REQUIRED (per portfolio, ongoing):** Cloudinary `cloud_name` + unsigned `upload_preset` must be configured before activity cover/gallery uploads work.
- In-browser walkthrough (create draft → bilingual content → cover → gallery → reorder → publish → switch portfolios) was **not** executed in this session: no authenticated browser tools were available.

### Known issues

- Gallery reorder is sequential per-row `sort_order` updates (fine for typical gallery sizes; not a bulk RPC).
- Activity list cover query is a second request (covers only, not gallery).
- JS bundle still exceeds 500 kB (pre-existing; route-level code-splitting deferred).

### Recommended next phase

**Phase 7 — Social Links CRUD** on the existing `social_links` table. Do not start SEO UI, RBAC, or AI translation.

---

## RLS / table-privilege fix (post Phase 6)

### Root cause

RLS policies (`*_authenticated_all` for `authenticated`, `USING (true) WITH CHECK (true)`) were already on every CMS table. New Supabase projects **do not auto-GRANT** `public` tables to Data API roles. Live privileges before the fix:

| Table | RLS | `authenticated` GRANT | Result |
|---|---|---|---|
| `portfolios` | on | SELECT/INSERT/UPDATE/DELETE | worked |
| `activities` | on | none | 403 `permission denied for table activities` |
| `media` | on | none | 403 `permission denied for table media` |
| `cloudinary_configs` | on | none | 403 `permission denied for table cloudinary_configs` |
| `portfolio_settings` | on | none | would 403 on Settings |
| `seo_meta` / `social_links` | on | none | left locked (stubs) |

Postgres never evaluates RLS if the role lacks table privileges, so the existing policies never ran.

No frontend bug. Auth/login was not changed.

### Change made (smallest safe)

Migration `20260825120011_grant_authenticated_cms_table_privileges.sql`:

- `GRANT SELECT, INSERT, UPDATE, DELETE` on `portfolios`, `activities`, `media`, `cloudinary_configs`, `portfolio_settings` **to `authenticated` only**
- `REVOKE ALL` on those tables **from `anon`**
- RLS left enabled; existing policies left unchanged
- No GRANTs on `seo_meta`, `social_links`, or leftover Prisma tables
- No `service_role` in the frontend, no public write/read

V1 isolation model is unchanged: any **authenticated CMS user** may manage all portfolios (no RBAC). Portfolio isolation is still `portfolio_id` on every query/query key. `anon` still has no table access.

### Verification (hosted project, as `authenticated`, rolled back)

- SELECT `portfolios` / `activities` / `media` / `cloudinary_configs` / `portfolio_settings` — pass
- INSERT activity + media + upsert cloudinary_configs — pass
- UPDATE activity, set `deleted_at`, restore `deleted_at = null` — pass
- Probe rows rolled back (leftover count 0)
- `authenticated` still denied on `seo_meta` (expected)
- `anon` still denied on `portfolios` (permission denied for schema public)
- `npx tsc -b --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — pass (existing >500 kB bundle warning)

### Remaining manual testing

Log into the CMS and confirm Activities, Media, Cloudinary Settings, and Portfolio Settings load and save for the test portfolio. Switch portfolios and confirm lists stay scoped.

---

## Phase 7 — Social Links CRUD

### Features implemented

- Route (already present): `/portfolios/:portfolioId/social-links`
- List ordered by `sort_order ASC`
- Create / edit form: platform (enum select), URL, custom label when `platform = other`, visibility
- Show/Hide (`is_visible` only — row stays)
- Move Up / Move Down persisted as `sort_order` (portfolio-scoped)
- Hard delete with `ConfirmDialog` (schema has no `deleted_at` on this table)
- Empty / loading / error states reuse shared components

### Important decisions

- No new table, no schema/column/enum/RLS-policy changes.
- GRANT-only migration `20260825180012` — required because `social_links` was left un-granted in `20260825120011` until this phase.
- `portfolioId` comes from the active portfolio (URL/layout), never from form input.
- `sort_order` is assigned as max+1 on create; not a user-editable field.
- For non-`other` platforms, `custom_label` is stored as `null`.
- Optional host mismatch check only when the URL is clearly another known social host; otherwise any valid URL is accepted.
- Delete is permanent. No media/portfolio rows are touched.
- Query keys always embed `portfolioId`. Mutations invalidate only that namespace.

### Files created

- `src/features/social-links/types/index.ts`
- `src/features/social-links/constants/queryKeys.ts`
- `src/features/social-links/constants/index.ts`
- `src/features/social-links/validation/socialLinkSchema.ts`
- `src/features/social-links/services/socialLinksService.ts`
- `src/features/social-links/utils/form.ts`
- `src/features/social-links/hooks/useSocialLinksQuery.ts`
- `src/features/social-links/hooks/useCreateSocialLinkMutation.ts`
- `src/features/social-links/hooks/useUpdateSocialLinkMutation.ts`
- `src/features/social-links/hooks/useDeleteSocialLinkMutation.ts`
- `src/features/social-links/hooks/useToggleSocialLinkVisibilityMutation.ts`
- `src/features/social-links/hooks/useReorderSocialLinksMutation.ts`
- `src/features/social-links/components/SocialLinkForm.tsx`
- `src/features/social-links/components/SocialLinkCard.tsx`
- `supabase/migrations/20260825180012_grant_authenticated_social_links.sql`

### Files modified

- `src/features/social-links/index.ts`
- `src/features/social-links/pages/SocialLinksPage.tsx` (stub replaced)
- `supabase/policies/social_links.md`
- `PROJECT_CONTEXT.md`
- `PROJECT_PROGRESS.md`

Router/route path was already wired; not changed.

### Validation

- platform required, from `social_platform` enum
- URL required, trimmed, valid URL
- custom_label required only when platform is `other` (max 80)
- is_visible boolean (default true)
- obvious cross-platform host mismatch is rejected; website/other have no host restriction

### Database / GRANT

- Reused `public.social_links`
- Live GRANT applied and recorded in `supabase_migrations.schema_migrations` as `20260825180012`
- RLS policy unchanged (`social_links_authenticated_all`)
- `seo_meta` still un-granted

### Testing

- `npx tsc -b --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — pass (existing >500 kB warning)
- Hosted as `authenticated` (rolled back): insert two links, hide, reorder, delete — leftover 0
- `anon` still denied; `seo_meta` still denied
- In-browser CMS UI walkthrough (create/edit/reorder/switch portfolios) was **not** run here

### Known issues / remaining manual

- **MANUAL ACTION:** log into the CMS and walk through Social Links on two portfolios to confirm UI isolation. Hosted DB currently has a small number of portfolios; service queries are always `.eq('portfolio_id', portfolioId)`.
- Cloudinary config per portfolio remains an ongoing operator task.

### Recommended next phase

**Phase 8 — CMS polish / production hardening.** SEO UI still not scheduled.

---

## Phase 9 blocker — anon public read (portfolios / activities / media)

### Why

The Sampatiya public website (separate repo) reads this same Supabase project with the **anon/publishable** key. It failed with `42501 permission denied for schema public` because `anon` had **no USAGE on schema public** and **no table SELECT**. Authenticated CMS access was already working.

This is not Sampatiya frontend integration. It only unblocks public SELECT.

### What was granted to anon

- `GRANT USAGE ON SCHEMA public TO anon` (not CREATE)
- `GRANT SELECT` on `public.portfolios`, `public.activities`, `public.media` only
- No INSERT/UPDATE/DELETE for anon
- Authenticated table privileges unchanged
- `social_links`, `cloudinary_configs`, `portfolio_settings`, `seo_meta` remain un-granted to anon

### RLS policies added (SELECT only; not `USING (true)`)

- `portfolios_anon_select_active` — `status = 'active' AND deleted_at IS NULL`
- `activities_anon_select_published` — `status = 'published' AND deleted_at IS NULL` and parent portfolio is active/non-deleted
- `media_anon_select_public` — `deleted_at IS NULL`, parent portfolio is active/non-deleted, and if `activity_id` is set the activity is published/non-deleted

Existing `*_authenticated_all` policies were not modified.

### Public data vs private

**Public:** active non-deleted portfolios; published non-deleted activities on those portfolios; non-deleted media of those portfolios (portfolio-level profile/cover/favicon, plus cover/gallery of published activities).

**Private to anon:** drafts, scheduled, archived, soft-deleted activities; inactive/deleted portfolios; media of drafts or deleted rows; social links, Cloudinary config, portfolio settings, SEO.

### Migration

`supabase/migrations/20260826120013_grant_anon_public_read_access.sql`  
Recorded in `supabase_migrations.schema_migrations` as `20260826120013`.  
`supabase db push --linked` still fails on this project’s CLI login role; the migration SQL was applied via the Management API (same path as the earlier GRANT migrations) — not ad-hoc Dashboard SQL.

### Verification

- Anon schema USAGE true; SELECT true; INSERT/UPDATE/DELETE false on the three tables
- All 9 anon write attempts (insert/update/delete × 3 tables) → permission denied
- Rolled-back filter test: published activity 1; draft/scheduled/archived/deleted/inactive-portfolio 0; public portfolio cover + published activity cover 1 each; draft cover + deleted media 0; leftover probe rows 0
- PostgREST with publishable key: SELECT portfolios returns the active test portfolio; INSERT portfolios denied
- Authenticated still reads CMS tables (portfolios, activities, media, social_links, cloudinary_configs, portfolio_settings)
- `npx tsc -b --noEmit`, `npm run lint`, `npm run build` — pass

### Files

Created: `supabase/migrations/20260826120013_grant_anon_public_read_access.sql`  
Modified: `supabase/policies/{portfolios,activities,media}.md`, `PROJECT_CONTEXT.md`, `PROJECT_PROGRESS.md`

No CMS application code, no Sampatiya website code.

---

## Activity form + CMS freshness (this task)

### 1. Supabase freshness investigation

Inspected: `src/shared/lib/supabase/client.ts`, `src/shared/lib/query-client.ts`, `STALE_TIME`, activity/media/portfolio query hooks, mutation `invalidateQueries`, hosted project status.

### 2. Actual root cause of “7–9 day delay”

**Not CMS React Query cache.** Evidence:

- Default `staleTime` is 5 minutes (`STALE_TIME.medium`); activity list/detail use 30 seconds (`STALE_TIME.short`).
- `gcTime` is TanStack Query v5 default (~5 minutes). That cannot hide writes for days.
- Create/update mutations invalidate `activityKeys` for the current `portfolioId` immediately.
- The hosted project `ymxpboccinislragdrnz` was `ACTIVE_HEALTHY` during this inspection.
- Writes go straight to Postgres via the authenticated client. After the Phase 9 anon SELECT policies, the public site reads the same rows live — there is no CMS-side “hold for a week.”

A 7–9 day lag **matches Supabase Free-plan inactivity pause** (pause after ~7 days idle, then slow wake), but **that was not verified as this project’s billing plan** (org plan fields were empty in the Management API). Pause would make the API fail until wake, not silently delay a successful write.

Other CMS-side contributors that *can* make new activities “not show” on the public site immediately (and were addressed below):

- New activities defaulted to **draft**, which anon RLS does **not** return.
- `display_date` was a second, optional string; public readers that prefer it over `activity_date` would see a blank date until someone filled it.

### 3. Fix applied (CMS)

- **Did not add a keep-alive/cron.** No verified pause, no `service_role`, no fake browser cron. If the project is later confirmed Free-tier pausing, the safe option is a GitHub Action (or other external scheduler) doing an anon `GET` on `portfolios` — not implemented here.
- New activities default to **published** so they pass anon RLS as soon as required bilingual fields + `activity_date` are present.
- `display_date` is no longer a CMS input; on save it is copied from `activity_date` so older public readers still have a date string.

### 4. Keep-alive / cron

**Not added.** Not verified as necessary. Limitation: if this is a Free project and it pauses after 7 idle days, operators must open the CMS/Supabase dashboard to wake it, or upgrade the plan.

### 5–6. Display date removed; activity_date canonical

- Removed the Display date input from create/edit.
- DB column `display_date` **kept** (no migration).
- On create/update, `display_date` is set to the same `YYYY-MM-DD` as `activity_date`.
- List cards show **Activity date** only.
- Existing rows still load; the next save aligns `display_date` with `activity_date`.

### 7. Published default

`toFormValues()` with no activity uses `status: 'published'`. Edit still loads `activity.status`.

### 8. Featured default

New activities: `is_featured: true`. Edit loads stored `is_featured` (false stays false).

### 9. Responsive improvements

- Activity pages: `w-full min-w-0 max-w-3xl`
- Form/grid fields: `min-w-0`; date/datetime inputs cannot force overflow
- Dashboard `main`: `overflow-x-hidden p-4 sm:p-6`
- Save button full-width on mobile
- Cover/gallery uploader: `w-full max-w-*`

### 10. Description textarea sizing

English and Hindi description: `rows={5}`, `min-h-[8rem]` (~128px), `max-h-80`, `resize-y`. Limits unchanged (10000 chars).

### 11. Browser testing

CMS dev server was up on `:5173`. **Authenticated form walkthrough was not completed** — no CMS login credentials in this session. Verified in source and production bundle: the string `Display date` is absent from `dist/`. Defaults and layout are in `toFormValues` / `ActivityForm` as specified.

### 12–14. Quality

- TypeScript (`npx tsc -b --noEmit`) — pass
- ESLint (`npm run lint`) — pass (no new issues)
- Build (`npm run build`) — pass (existing >500 kB warning)

### 15. Remaining limitations

- 7–9 day lag is **not claimed fixed**. Cache is not the cause; Free-tier pause is unconfirmed.
- Authenticated UI tests (new vs edit defaults, cover upload, 375/390 viewports) still need a logged-in CMS session.
- Sampatiya public website was not modified.

**Files changed:** `ActivityForm.tsx`, `form.ts`, `activitySchema.ts`, `ActivityCreatePage.tsx`, `ActivityEditPage.tsx`, `ActivitiesPage.tsx`, `ActivityCard.tsx`, `ActivityCoverManager.tsx`, `ActivityGalleryManager.tsx`, `ImageUploader.tsx` (mobile max-width), `DashboardLayout.tsx` (overflow/padding), `PROJECT_PROGRESS.md`.

---

## Activity create: images + auto slug

- **Create-form media:** New Activity can select a cover and gallery files in the same form. Internally: validate → create activity → unsigned Cloudinary upload (portfolio config) → `media` rows with `role=cover` / `role=gallery` and gallery `sort_order`. No images still creates the activity. If upload fails after create, the activity is kept and the user is sent to Edit with: “Activity was created, but the image upload failed. Please retry the media upload.” Edit cover/gallery workflow is unchanged.
- **Slug UI:** Slug input removed. New slugs come from English title (else Hindi) via existing `slugify`. Edit never changes the stored slug.
- **Duplicates:** Uniqueness is per portfolio (`activities(portfolio_id, slug)` where `deleted_at is null`). First try the clean slug; on collision append a random 3–5 character `[a-z0-9]` suffix. Insert unique-violation races retry with a new suffix (limited). Users never see raw Postgres unique errors.
- **Testing:** `npx tsc -b --noEmit` pass; `npm run lint` pass; `npm run build` pass. Authenticated browser create/upload not run (no CMS credentials in this session).
- **Limitation:** Live create-with-images and duplicate-slug UI flows still need a logged-in CMS session.

**Files:** `activitiesService.ts`, `ActivityForm.tsx`, `ActivityCreatePage.tsx`, `ActivityEditPage.tsx`, `PendingActivityMedia.tsx`, `attachPendingMedia.ts`, `slug.ts`, `form.ts`, `activitySchema.ts`, `errors.ts`, `media/index.ts` (export `mediaService`).

---

## Activity date defaults, readable dates, local image previews

- **New Activity date:** the date input is prefilled with today's **local** `YYYY-MM-DD` (`localDateYmd()`, not UTC). If the field is cleared, create submit and `activitiesService.create` still fall back to today. Edit loads and preserves the stored date (cleared edit field falls back to the existing value, not today).
- **Display format:** list/detail use `formatDate()` → `31 August 2026` by parsing `YYYY-MM-DD` parts (no `new Date("YYYY-MM-DD")` timezone shift). Native `<input type="date">` still uses ISO. Display Date field remains removed.
- **Create-form previews:** pending cover/gallery store `URL.createObjectURL(file)` at select time (not Cloudinary). Images render with `object-cover`. Blob URLs are revoked on replace/remove/unmount. Edit still uses Cloudinary URLs for existing media.
- **Tests:** typecheck, lint, build pass. Logged-in CMS browser session still unavailable.

**Files:** `datetime.ts`, `form.ts`, `activitiesService.ts`, `ActivityCreatePage.tsx`, `ActivityEditPage.tsx`, `PendingActivityMedia.tsx`, `attachPendingMedia.ts`.

---

## Unified activity images (Cover selection)

- Create and Edit share one Images area. No separate Cover Image vs Gallery uploaders on the form.
- Selecting files shows local blob previews immediately; first image is Cover by default. Exclusive Cover radio; changing Cover updates only `media.role`.
- Removing the Cover image auto-selects the first remaining image. A single image is always Cover.
- On submit, every image is saved. Selected Cover → `role = cover`; others → `role = gallery`; `sort_order` follows the visible list. Schema unchanged.
- Edit loads existing cover + gallery, keeps gallery unless removed, remounts the field after save so pending files are not re-uploaded.
- Blob URLs revoked on remove/unmount.

**Files:** `ActivityImagesField.tsx`, `ActivityForm.tsx`, `ActivityCreatePage.tsx`, `ActivityEditPage.tsx`, `attachPendingMedia.ts`, `mediaService.ts` (`listActivityImages`, `insertActivityImage`, `applyActivityImageRoles`), `useActivityImagesQuery.ts`.

---

## Still stubbed / deferred

- SEO — table exists, UI intentionally not scheduled
- Public portfolio websites — out of this repository (Sampatiya Activities integration can proceed now that anon SELECT works)
- Auto-publish job for `status = scheduled` — index exists, no job implemented
