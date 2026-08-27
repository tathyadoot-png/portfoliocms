# RLS — seo_meta

Documentation only. Actual policy SQL: `migrations/20260817120007_create_seo_meta_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `seo_meta_authenticated_all` | `authenticated` | ALL | Full read/write. |

`anon`: no policy, no access today. Will need a scoped `anon` SELECT policy
once the public site renders SEO tags directly from this table.
