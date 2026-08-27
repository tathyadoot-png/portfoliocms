-- seo_meta: per-portfolio SEO overrides. Falls back to portfolio basic info
-- at the application layer when fields are unset.

create table public.seo_meta (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null unique references public.portfolios (id) on delete cascade,
  meta_title_en text,
  meta_title_hi text,
  meta_description_en text,
  meta_description_hi text,
  keywords text[],
  canonical_url text,
  og_image_media_id uuid references public.media (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index seo_meta_og_image_media_id_idx
  on public.seo_meta (og_image_media_id);

create trigger set_updated_at
  before update on public.seo_meta
  for each row
  execute function public.set_updated_at();

alter table public.seo_meta enable row level security;

create policy seo_meta_authenticated_all
  on public.seo_meta
  for all
  to authenticated
  using (true)
  with check (true);
