# Portfolio CMS — Project Progress

Living implementation history. If this file and the code disagree, **the code is correct**.

---

## Current state

**Phase 7 (Social Links CRUD) is complete.** The CMS can list/create/edit/delete/hide/reorder per-portfolio social links on the existing `social_links` table. GRANT migration `20260825180012` is applied on the hosted project (`authenticated` only; `anon` revoked; RLS unchanged).

Next planned work: **Phase 8 — CMS polish / production hardening** (SEO UI still not scheduled).

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
| **7** | **Social Links CRUD (this phase)** |

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

## Still stubbed / deferred

- SEO — table exists, UI intentionally not scheduled
- Public portfolio websites — out of this repository
- Auto-publish job for `status = scheduled` — index exists, no job implemented
