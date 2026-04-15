---
phase: 18-core-data-layer
plan: "01"
subsystem: data-layer
tags: [drizzle-orm, database, schema, neon-http, infrastructure]
dependency_graph:
  requires: []
  provides: [src/db/schema.ts, src/db/index.ts, drizzle.config.ts]
  affects: [18-02, 18-03]
tech_stack:
  added: [drizzle-orm@0.45.2, "@neondatabase/serverless", drizzle-kit@0.31.10]
  patterns: [drizzle-neon-http-singleton, pgTable-schema-mirroring]
key_files:
  created:
    - src/db/schema.ts
    - src/db/index.ts
    - drizzle.config.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - "Use timestamp({ withTimezone: true }) instead of timestamptz — timestamptz is not exported from drizzle-orm/pg-core@0.45.2"
  - "timestamptz alias defined as local helper in schema.ts to preserve semantic clarity and match SQL column types"
metrics:
  duration: 134s
  completed: "2026-04-15"
  tasks_completed: 1
  files_created: 3
  files_modified: 2
---

# Phase 18 Plan 01: Drizzle ORM Setup & Schema Definition Summary

**One-liner:** Drizzle ORM installed with neon-http adapter and pgTable schema mirroring all 5 Supabase tables (wallets, transactions, userProfiles, cards, recipients) with bigint mode:number throughout.

## What Was Built

Established the Drizzle ORM data layer foundation that all subsequent Phase 18 plans depend on:

- **`src/db/schema.ts`** — 5 `pgTable` definitions mirroring `supabase-schema.sql`:
  - `wallets` — balance, maxTopup as bigint mode:number
  - `transactions` — amount, convertedAmount, fee, exchangeRate; metadata as text (JSON-serialized)
  - `userProfiles` — full schema including all Phase 02 auth columns, Phase 15 WebAuthn columns, Phase 17 spending limits
  - `cards` — balance as bigint mode:number, isFrozen boolean
  - `recipients` — standard recipient fields

- **`src/db/index.ts`** — db singleton via `neon()` + `drizzle({ client: sql, schema })`. Module-level singleton avoids per-request connection overhead.

- **`drizzle.config.ts`** — drizzle-kit configuration for `npx drizzle-kit pull/push` tooling.

## Acceptance Criteria Results

| Check | Result |
|-------|--------|
| `node_modules/drizzle-orm` installed | PASS (0.45.2) |
| `node_modules/@neondatabase/serverless` installed | PASS |
| `node_modules/drizzle-kit` installed (devDependencies) | PASS |
| `src/db/schema.ts` exports 5 tables | PASS (5) |
| All bigint columns use `mode: 'number'` | PASS (10 occurrences) |
| `src/db/index.ts` exports `db` | PASS |
| `src/db/index.ts` imports from `drizzle-orm/neon-http` | PASS |
| `drizzle.config.ts` contains `dialect: 'postgresql'` | PASS |
| `.env.local.example` contains `DATABASE_URL=` line | PASS (gitignored — updated locally) |
| TypeScript compilation: no errors in db files | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `timestamptz` not exported from drizzle-orm/pg-core@0.45.2**
- **Found during:** Task 1 TypeScript compilation check
- **Issue:** The plan and research docs referenced `timestamptz` as a named export from `drizzle-orm/pg-core`, but the actual installed version (0.45.2) only exports `timestamp`. Using `timestamptz` caused `error TS2724: '"drizzle-orm/pg-core"' has no exported member named 'timestamptz'`.
- **Fix:** Replaced `timestamptz` import with `timestamp` and defined a local alias `const timestamptz = (name: string) => timestamp(name, { withTimezone: true })` at the top of schema.ts. This produces identical SQL column types while preserving the semantic clarity of the `timestamptz` name throughout the file.
- **Files modified:** `src/db/schema.ts`
- **Commit:** e096253

## Commits

| Hash | Description |
|------|-------------|
| e096253 | feat(18-01): install Drizzle ORM and define database schema |

## Known Stubs

None — this plan is pure infrastructure (schema definitions + db singleton). No data flows to UI rendering from this plan directly.

## Self-Check: PASSED

- `src/db/schema.ts` — FOUND
- `src/db/index.ts` — FOUND
- `drizzle.config.ts` — FOUND
- commit e096253 — FOUND
