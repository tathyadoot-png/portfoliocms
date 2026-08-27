# RLS — social_links

Documentation only. Actual policy SQL: `migrations/20260817120008_create_social_links_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `social_links_authenticated_all` | `authenticated` | ALL | Full read/write. |

`anon`: no policy, no access.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825180012_grant_authenticated_social_links.sql`).
`anon` is revoked. RLS policies are not evaluated without these GRANTs.
