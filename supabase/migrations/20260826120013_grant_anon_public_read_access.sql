-- Public-read access for the separate portfolio websites (Sampatiya first).
-- They use the anon/publishable key against this same Supabase project.
--
-- Root cause of 42501 "permission denied for schema public":
--   anon had no USAGE on schema public and no SELECT on CMS tables.
--
-- This migration is additive only:
--   * GRANT USAGE on schema public to anon
--   * GRANT SELECT (not write) on portfolios, activities, media to anon
--   * narrowly scoped anon SELECT RLS policies
-- Authenticated CMS policies are left untouched. No table/enum/index changes.
-- seo_meta, social_links, cloudinary_configs, portfolio_settings stay private.

grant usage on schema public to anon;

grant select
  on table
    public.portfolios,
    public.activities,
    public.media
  to anon;

-- Active, non-deleted portfolios only.
create policy portfolios_anon_select_active
  on public.portfolios
  for select
  to anon
  using (
    status = 'active'
    and deleted_at is null
  );

-- Published, non-deleted activities on a publicly readable portfolio.
create policy activities_anon_select_published
  on public.activities
  for select
  to anon
  using (
    status = 'published'
    and deleted_at is null
    and exists (
      select 1
      from public.portfolios p
      where p.id = activities.portfolio_id
        and p.status = 'active'
        and p.deleted_at is null
    )
  );

-- Non-deleted media whose parent portfolio is public, and whose parent
-- activity (when set) is published. Portfolio-level rows (activity_id is
-- null: profile/cover/favicon) are allowed for active portfolios so public
-- sites can show identity images later. Activity cover/gallery requires a
-- published, non-deleted activity.
create policy media_anon_select_public
  on public.media
  for select
  to anon
  using (
    deleted_at is null
    and exists (
      select 1
      from public.portfolios p
      where p.id = media.portfolio_id
        and p.status = 'active'
        and p.deleted_at is null
    )
    and (
      activity_id is null
      or exists (
        select 1
        from public.activities a
        where a.id = media.activity_id
          and a.status = 'published'
          and a.deleted_at is null
      )
    )
  );
