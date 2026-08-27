-- Shared trigger function used by every table's `updated_at` trigger.
-- search_path is pinned explicitly to avoid the "mutable search_path"
-- security warning on functions that don't otherwise need one.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
