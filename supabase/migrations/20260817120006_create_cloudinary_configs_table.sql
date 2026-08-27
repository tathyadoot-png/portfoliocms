-- cloudinary_configs: per-portfolio Cloudinary account binding.
-- Unsigned uploads only (V1 decision) - no api_secret column exists here or
-- anywhere else in this schema.

create table public.cloudinary_configs (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null unique references public.portfolios (id) on delete cascade,
  cloud_name text not null,
  upload_preset text not null,
  default_folder text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.cloudinary_configs
  for each row
  execute function public.set_updated_at();

alter table public.cloudinary_configs enable row level security;

create policy cloudinary_configs_authenticated_all
  on public.cloudinary_configs
  for all
  to authenticated
  using (true)
  with check (true);
