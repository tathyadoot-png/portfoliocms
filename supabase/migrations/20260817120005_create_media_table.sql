-- media: the single table for every uploaded asset (portfolio profile/cover/
-- favicon images and activity cover/gallery images). Cloudinary stores the
-- binary; this table stores metadata + a reference only.
--
-- Ownership uses an exclusive-arc FK pair (portfolio_id always set,
-- activity_id nullable) rather than a polymorphic entity_type/entity_id
-- column, so real foreign keys and cascade rules stay enforceable.

create table public.media (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  activity_id uuid references public.activities (id) on delete cascade,
  role public.media_role not null,
  kind public.media_kind not null default 'image',
  cloudinary_public_id text not null,
  cloudinary_secure_url text not null,
  width integer,
  height integer,
  format text,
  bytes integer,
  alt_text_en text,
  alt_text_hi text,
  caption_en text,
  caption_hi text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  -- profile/favicon: portfolio-level only -> activity_id must be null.
  -- gallery: activity-level only -> activity_id must be set.
  -- cover: valid at both levels (portfolio cover or activity cover), so it
  -- is intentionally unconstrained here.
  constraint media_ownership_check check (
    case
      when role in ('profile', 'favicon') then activity_id is null
      when role = 'gallery' then activity_id is not null
      else true
    end
  )
);

create index media_portfolio_id_role_idx
  on public.media (portfolio_id, role);

create index media_activity_id_role_sort_order_idx
  on public.media (activity_id, role, sort_order);

create trigger set_updated_at
  before update on public.media
  for each row
  execute function public.set_updated_at();

alter table public.media enable row level security;

create policy media_authenticated_all
  on public.media
  for all
  to authenticated
  using (true)
  with check (true);
