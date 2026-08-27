# Storage

No Supabase Storage buckets are provisioned in V1. Cloudinary is the sole
media store for all portfolio and activity assets (unsigned uploads,
per-portfolio credentials in `cloudinary_configs`). Supabase only stores
metadata/references to Cloudinary assets, in the `media` table.

This folder exists so that absence is explicit rather than assumed. The
only plausible future use is a private, admin-only bucket for something
Cloudinary shouldn't hold (e.g. internal document exports) — not a current
requirement, not built.
