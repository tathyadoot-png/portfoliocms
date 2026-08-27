# RLS — portfolios

Documentation only. Actual policy SQL: `migrations/20260817120003_create_portfolios_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `portfolios_authenticated_all` | `authenticated` | ALL | Full read/write, including soft-deleted rows (needed for a future trash/restore UI). |

`anon`: no policy, no access.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825120011_grant_authenticated_cms_table_privileges.sql`).
`anon` is revoked. RLS policies are not evaluated without these GRANTs.

V1 has one admin, no RBAC. When `portfolio_admins` lands, this policy is
superseded by a new migration — never edited in place.
