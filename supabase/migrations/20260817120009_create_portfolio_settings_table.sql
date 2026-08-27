-- portfolio_settings: branding/contact/legal config, separate from the core
-- `portfolios` identity table (same rationale as cloudinary_configs and
-- seo_meta: optional, deferred, different access pattern). Custom
-- primary/secondary color overrides are intentionally NOT included in V1 -
-- `portfolios.theme` is the only branding control, mapped to design tokens
-- on the frontend.

create table public.portfolio_settings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null unique references public.portfolios (id) on delete cascade,
  favicon_media_id uuid references public.media (id) on delete set null,
  contact_email text,
  contact_phone text,
  address_en text,
  address_hi text,
  google_map_url text,
  copyright_text_en text,
  copyright_text_hi text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index portfolio_settings_favicon_media_id_idx
  on public.portfolio_settings (favicon_media_id);

create trigger set_updated_at
  before update on public.portfolio_settings
  for each row
  execute function public.set_updated_at();

alter table public.portfolio_settings enable row level security;

create policy portfolio_settings_authenticated_all
  on public.portfolio_settings
  for all
  to authenticated
  using (true)
  with check (true);
