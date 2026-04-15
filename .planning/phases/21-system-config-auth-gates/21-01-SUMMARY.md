---
phase: 21-system-config-auth-gates
plan: "01"
subsystem: system-config
tags: [system-config, maintenance, version-gate, drizzle, api]
dependency_graph:
  requires: []
  provides: [system_config-table, system-status-api, SystemStateChecker-extended]
  affects: [src/db/schema.ts, src/app/api/system-status/route.ts, src/components/features/system-state-checker.tsx, src/components/features/update-required-modal.tsx]
tech_stack:
  added: []
  patterns: [drizzle-inArray, semver-comparison, fail-open-error-handling, per-session-dismiss-state]
key_files:
  created:
    - supabase/migrations/20260415_add_system_config.sql
  modified:
    - src/db/schema.ts
    - src/app/api/system-status/route.ts
    - src/components/features/system-state-checker.tsx
    - src/components/features/update-required-modal.tsx
    - .planning/supabase-schema.sql
    - supabase/seed.sql
decisions:
  - "Maintenance modal onClose is a no-op per AUTH-02 spec — modal stays open until maintenance=false in DB"
  - "API fails open on DB error — returns {maintenance:false, hardUpdate:false, softUpdate:false} to avoid blocking users"
  - "softUpdateDismissed stored in component state (per-session), not localStorage — resets on each app open"
  - "semverGt strips JSON-serialized quotes before comparison (versions stored as '\"0.1.0\"' in DB)"
metrics:
  duration: 218s
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_modified: 6
  files_created: 1
---

# Phase 21 Plan 01: System Config DB + Auth Gates Summary

**One-liner:** system_config Drizzle table + DB-backed /api/system-status with semver hard/soft update gates and dismissible soft update modal.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | system_config Drizzle schema + SQL migration + seed row | 79c1a49 | src/db/schema.ts, supabase/migrations/20260415_add_system_config.sql, .planning/supabase-schema.sql, supabase/seed.sql |
| 2 | Rewrite /api/system-status + extend SystemStateChecker for soft/hard update | bea819a | src/app/api/system-status/route.ts, src/components/features/system-state-checker.tsx, src/components/features/update-required-modal.tsx |

## What Was Built

### system_config Table (Task 1)

Added `systemConfig` pgTable to `src/db/schema.ts` with:
- `key` text PRIMARY KEY
- `value` text NOT NULL (JSON-serialized: `'true'`/`'false'` for booleans, `'"0.1.0"'` for versions)
- `updatedAt` timestamptz NOT NULL DEFAULT now()

Created idempotent migration `supabase/migrations/20260415_add_system_config.sql` with three default rows:
- `maintenance_mode = 'false'`
- `min_version = '"0.1.0"'`
- `recommended_version = '"0.1.0"'`

Appended matching DDL to `.planning/supabase-schema.sql` and seed rows to `supabase/seed.sql`.

### /api/system-status Rewrite (Task 2)

Replaced env-var based route with DB-backed implementation:
- Reads all three config keys in one `inArray` query
- `semverGt(a, b)` strips JSON quotes then compares major.minor.patch numerically
- `hardUpdate = semverGt(min_version, APP_VERSION)` — blocking, no dismiss
- `softUpdate = !hardUpdate && semverGt(recommended_version, APP_VERSION)` — dismissible
- Fails open on DB error: returns all-false to avoid blocking users

### UpdateRequiredModal Extension (Task 2)

Added `soft?: boolean` and `onDismiss?: () => void` props:
- `soft=false` (default): Quit / Now buttons, no dismiss mechanism
- `soft=true`: Later (calls onDismiss) / Update buttons

### SystemStateChecker Extension (Task 2)

Extended `SystemStatus` interface from `{ maintenance, updateRequired }` to `{ maintenance, hardUpdate, softUpdate }`.

Renders three independent modals:
1. `MaintenanceModal` — `onClose` is no-op (non-dismissible per AUTH-02)
2. `UpdateRequiredModal` — hard update, always blocking
3. `UpdateRequiredModal soft` — soft update, dismissed once per session via `softUpdateDismissed` state

## Decisions Made

1. **Maintenance modal non-dismissible**: Per AUTH-02 spec. The `onClose` prop is preserved for component API compatibility but the handler is `() => {}`. The modal cannot be bypassed — it persists until `maintenance_mode` is set to `'false'` in the DB.

2. **Fail open on DB error**: If `system_config` is unreachable, the API returns `{ maintenance: false, hardUpdate: false, softUpdate: false }` — users are not blocked by infrastructure failures.

3. **Per-session soft update dismiss**: `softUpdateDismissed` is React component state (not localStorage). It resets on each page load/app open, which is appropriate for a "reminder" banner.

4. **JSON-serialized version strings**: Versions stored as `'"0.1.0"'` (with quotes inside the text column). `semverGt` strips them before comparison so DB values are safe to edit as human-readable JSON.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — all three config keys have real default values in the DB; the API reads live data.

## Self-Check: PASSED

Files verified to exist:
- src/db/schema.ts — contains `export const systemConfig`
- supabase/migrations/20260415_add_system_config.sql — contains `create table if not exists public.system_config`
- src/app/api/system-status/route.ts — contains `hardUpdate` and `softUpdate`
- src/components/features/system-state-checker.tsx — contains `softUpdate` and `softUpdateDismissed`
- src/components/features/update-required-modal.tsx — contains `onDismiss` and `Later`

Commits verified:
- 79c1a49 — feat(21-01): add system_config Drizzle schema + SQL migration + seed rows
- bea819a — feat(21-01): rewrite system-status route + extend SystemStateChecker for soft/hard update
