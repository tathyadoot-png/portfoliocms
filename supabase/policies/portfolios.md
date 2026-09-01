# RLS — portfolios

Documentation only. Actual policy SQL: `migrations/20260817120003_create_portfolios_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `portfolios_authenticated_all` | `authenticated` | ALL | Full read/write, including soft-deleted rows (needed for a future trash/restore UI). |
| `portfolios_anon_select_active` | `anon` | SELECT | Active, non-deleted portfolios only. |

`anon`: SELECT-only, restricted by the policy above. No INSERT/UPDATE/DELETE.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825120011_grant_authenticated_cms_table_privileges.sql`).
`anon` has SELECT only (`migrations/20260826120013_grant_anon_public_read_access.sql`).

V1 has one admin, no RBAC. When `portfolio_admins` lands, this policy is
superseded by a new migration — never edited in place.
