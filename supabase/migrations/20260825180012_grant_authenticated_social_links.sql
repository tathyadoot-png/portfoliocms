-- Phase 7: expose `social_links` to the authenticated Data API role.
-- RLS policy `social_links_authenticated_all` already exists. Without a
-- table GRANT, PostgREST returns 403 "permission denied for table social_links".
-- No schema, enum, or RLS-policy changes. seo_meta remains un-granted.

grant select, insert, update, delete
  on table public.social_links
  to authenticated;

revoke all
  on table public.social_links
  from anon;
