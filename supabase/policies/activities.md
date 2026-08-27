# RLS — activities

Documentation only. Actual policy SQL: `migrations/20260817120004_create_activities_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `activities_authenticated_all` | `authenticated` | ALL | Full read/write, including soft-deleted rows. |

`anon`: no policy, no access. When the public site reads this table later,
add a narrowly-scoped `anon` SELECT policy limited to
`status = 'published' AND deleted_at IS NULL` — do not widen this policy.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825120011_grant_authenticated_cms_table_privileges.sql`).
`anon` is revoked. RLS policies are not evaluated without these GRANTs.
