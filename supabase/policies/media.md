# RLS — media

Documentation only. Actual policy SQL: `migrations/20260817120005_create_media_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `media_authenticated_all` | `authenticated` | ALL | Full read/write, including soft-deleted rows. |

`anon`: no policy, no access.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825120011_grant_authenticated_cms_table_privileges.sql`).
`anon` is revoked. RLS policies are not evaluated without these GRANTs.
