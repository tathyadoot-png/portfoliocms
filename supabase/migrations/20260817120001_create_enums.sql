-- Enums for the Portfolio CMS schema (Phase 3).
-- gen_random_uuid() is used for primary keys; it is built into PostgreSQL 13+
-- core, so no pgcrypto/uuid-ossp extension is required on Supabase.

create type public.portfolio_status as enum (
  'active',
  'inactive'
);

create type public.activity_status as enum (
  'draft',
  'scheduled',
  'published',
  'archived'
);

create type public.media_role as enum (
  'profile',
  'cover',
  'gallery',
  'favicon'
);

create type public.media_kind as enum (
  'image',
  'video',
  'document'
);

create type public.social_platform as enum (
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
  'whatsapp',
  'website',
  'other'
);
