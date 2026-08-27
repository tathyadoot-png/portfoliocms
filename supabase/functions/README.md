# Edge Functions

Empty by design in V1.

- Cloudinary uploads are unsigned and go browser -> Cloudinary directly, so
  no signing endpoint is needed.
- The scheduled-activity auto-publish job (`activities.status = 'scheduled'`
  crossing `publish_at`) is implemented as a `pg_cron` scheduled SQL
  statement, not an Edge Function — it's a plain `UPDATE`, and keeping it in
  the database avoids a separate deploy/cold-start surface.

Add a function here only when something genuinely requires code outside SQL
(a third-party API call needing a secret, a webhook receiver, etc.).
