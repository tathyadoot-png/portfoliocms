# RLS — portfolio_settings

Documentation only. Actual policy SQL: `migrations/20260817120009_create_portfolio_settings_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `portfolio_settings_authenticated_all` | `authenticated` | ALL | Full read/write. |

`anon`: no policy, no access.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825120011_grant_authenticated_cms_table_privileges.sql`).
`anon` is revoked. RLS policies are not evaluated without these GRANTs.
