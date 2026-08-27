-- activities: shared content entity, identical shape across every portfolio.

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  slug text not null,
  title_en text not null,
  title_hi text not null,
  description_en text,
  description_hi text,
  location_en text,
  location_hi text,
  activity_date date,
  display_date text,
  status public.activity_status not null default 'draft',
  publish_at timestamptz,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Slugs are unique per portfolio (not globally), and free up again once the
-- activity is soft-deleted.
create unique index activities_portfolio_id_slug_key
  on public.activities (portfolio_id, slug)
  where deleted_at is null;

create index activities_portfolio_id_status_idx
  on public.activities (portfolio_id, status);

-- Primary listing query: activities for a portfolio ordered chronologically.
-- Sorting must always use activity_date, never the free-form display_date.
create index activities_portfolio_id_activity_date_idx
  on public.activities (portfolio_id, activity_date desc);

create index activities_portfolio_id_is_featured_idx
  on public.activities (portfolio_id, is_featured);

-- Supports a future auto-publish job scanning for scheduled activities whose
-- publish_at has passed.
create index activities_scheduled_publish_at_idx
  on public.activities (status, publish_at)
  where status = 'scheduled';

create trigger set_updated_at
  before update on public.activities
  for each row
  execute function public.set_updated_at();

alter table public.activities enable row level security;

create policy activities_authenticated_all
  on public.activities
  for all
  to authenticated
  using (true)
  with check (true);
