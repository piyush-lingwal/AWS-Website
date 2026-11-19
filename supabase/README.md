# Supabase SQL

All schema changes live in `supabase/migrations/`, in filename (timestamp) order.
There is no Supabase CLI config, so apply each file by hand in the SQL Editor
(or through the Supabase MCP) and run them in order on a new database.

| File | Notes |
|---|---|
| `20260929000001_base_schema` | Base tables (events, participants, attendance, certificates, portal config, audit log). Empty databases only; runs in one transaction and changes nothing if the tables already exist |
| `20261013000001_team_members` | Not re-runnable (`CREATE TABLE` without `IF NOT EXISTS`) |
| `20261017000001` onward | Admin users, RLS lock-down, media, certificates |
| `20261018000003_top_performers` | Top performers and excellence certificates |
| `20261112000001_media_supabase_source` | Supabase Storage as a media source (two buckets). Safe to re-run |

`seed-admins.sql` is not a migration. It is a one-off script you edit (add the
admin emails) and run manually, so it stays in this folder, outside `migrations/`.
