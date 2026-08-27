-- Adds an `updated_by` audit column to the two content-owning tables that
-- already carry `created_by`. Nullable, references auth.users, and nulls out
-- if the referenced user is deleted (matching the existing created_by FK).
-- Forward-only migration: earlier migration files are left untouched.

alter table public.portfolios
  add column updated_by uuid references auth.users (id) on delete set null;

alter table public.activities
  add column updated_by uuid references auth.users (id) on delete set null;
