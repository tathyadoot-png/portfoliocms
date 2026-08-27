# RLS — cloudinary_configs

Documentation only. Actual policy SQL: `migrations/20260817120006_create_cloudinary_configs_table.sql`.

RLS: enabled.

| Policy | Role | Command | Effect |
|---|---|---|---|
| `cloudinary_configs_authenticated_all` | `authenticated` | ALL | Full read/write. |

`anon`: no policy, no access. No secrets are stored in this table
(unsigned uploads only), but it is still authenticated-only.

Table privileges: `authenticated` has SELECT/INSERT/UPDATE/DELETE
(`migrations/20260825120011_grant_authenticated_cms_table_privileges.sql`).
`anon` is revoked. RLS policies are not evaluated without these GRANTs.
