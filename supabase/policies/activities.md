# RLS — activities

Documentation only. Actual policy SQL: `migrations/20260817120004_create_activities_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `activities_authenticated_all` | `authenticated` | ALL | Full read/write, including soft-deleted rows. |
| `activities_anon_select_published` | `anon` | SELECT | `status = published` AND `deleted_at IS NULL` AND parent portfolio is active and not deleted. Draft/scheduled/archived/deleted are not readable. |

`anon`: SELECT-only. No INSERT/UPDATE/DELETE.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825120011_grant_authenticated_cms_table_privileges.sql`).
`anon` has SELECT only (`migrations/20260826120013_grant_anon_public_read_access.sql`).
