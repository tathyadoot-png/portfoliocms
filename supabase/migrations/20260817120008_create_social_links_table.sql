-- social_links: ordered list of social/external links per portfolio.

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  platform public.social_platform not null,
  custom_label text,
  url text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index social_links_portfolio_id_sort_order_idx
  on public.social_links (portfolio_id, sort_order);

create trigger set_updated_at
  before update on public.social_links
  for each row
  execute function public.set_updated_at();

alter table public.social_links enable row level security;

create policy social_links_authenticated_all
  on public.social_links
  for all
  to authenticated
  using (true)
  with check (true);
