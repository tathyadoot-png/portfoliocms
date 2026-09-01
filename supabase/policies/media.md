# RLS — media

Documentation only. Actual policy SQL: `migrations/20260817120005_create_media_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `media_authenticated_all` | `authenticated` | ALL | Full read/write, including soft-deleted rows. |
| `media_anon_select_public` | `anon` | SELECT | Non-deleted media on an active non-deleted portfolio. Activity-scoped rows additionally require the activity to be published and not deleted. |

`anon`: SELECT-only. No INSERT/UPDATE/DELETE. Portfolio-level profile/cover/favicon of public portfolios is readable; draft-activity media is not.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825120011_grant_authenticated_cms_table_privileges.sql`).
`anon` has SELECT only (`migrations/20260826120013_grant_anon_public_read_access.sql`).
