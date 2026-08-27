-- New Supabase projects do not auto-GRANT public tables to Data API roles
-- (`authenticated` / `anon`). RLS policies on these tables already exist
-- (`*_authenticated_all`), but Postgres never evaluates them if the role
-- lacks table privileges — PostgREST then returns 403
-- "permission denied for table <name>".
--
-- Live state before this migration:
--   portfolios           : GRANT present for authenticated (working)
--   activities           : no GRANT (403)
--   media                : no GRANT (403)
--   cloudinary_configs   : no GRANT (403)
--   portfolio_settings   : no GRANT (would 403 on Settings)
--
-- Scope: only tables the CMS already uses. Do not expose leftover Prisma
-- tables, and do not expose seo_meta / social_links (stubs, later phases).
-- anon remains revoked. RLS stays enabled. No schema/column changes.

grant select, insert, update, delete
  on table
    public.portfolios,
    public.activities,
    public.media,
    public.cloudinary_configs,
    public.portfolio_settings
  to authenticated;

revoke all
  on table
    public.portfolios,
    public.activities,
    public.media,
    public.cloudinary_configs,
    public.portfolio_settings
  from anon;
