-- =============================================================================
-- Phase 21: System Config table
-- Runtime flags for maintenance mode and version gates.
-- No RLS — readable by anon role; service role manages writes.
-- Idempotent: safe to re-run.
-- =============================================================================
create table if not exists public.system_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Default rows (idempotent)
insert into public.system_config (key, value) values
  ('maintenance_mode', 'false'),
  ('min_version', '"0.1.0"'),
  ('recommended_version', '"0.1.0"')
on conflict (key) do nothing;
