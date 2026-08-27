-- portfolios: the politician entity. Root of every other table.

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  full_name_en text not null,
  full_name_hi text not null,
  designation_en text,
  designation_hi text,
  about_en text,
  about_hi text,
  status public.portfolio_status not null default 'active',
  theme text not null default 'default',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Soft-delete-aware uniqueness: a slug frees up once its portfolio is
-- soft-deleted.
create unique index portfolios_slug_key
  on public.portfolios (slug)
  where deleted_at is null;

create index portfolios_status_idx
  on public.portfolios (status);

create trigger set_updated_at
  before update on public.portfolios
  for each row
  execute function public.set_updated_at();

alter table public.portfolios enable row level security;

-- V1: any authenticated CMS user has full read/write access (including
-- soft-deleted rows, needed for a future trash/restore UI). No RBAC yet.
-- anon has no policy and is therefore denied by default.
create policy portfolios_authenticated_all
  on public.portfolios
  for all
  to authenticated
  using (true)
  with check (true);
