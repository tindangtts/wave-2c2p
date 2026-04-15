---
phase: 20-new-tables-seed
plan: "02"
subsystem: database
tags: [drizzle, vouchers, migration, atomic-write, demo-mode]
dependency_graph:
  requires: []
  provides: [vouchers-drizzle-table, vouchers-sql-migration, voucher-api-drizzle]
  affects: [src/app/api/voucher/route.ts, src/db/schema.ts]
tech_stack:
  added: []
  patterns: [db.batch atomic write, isDemoMode branch, drizzle select+update]
key_files:
  created:
    - supabase/migrations/20260415_add_vouchers.sql
  modified:
    - src/db/schema.ts
    - src/app/api/voucher/route.ts
decisions:
  - Voucher amount stored as bigint satang (same pattern as wallets/transactions)
  - db.batch() used for atomic redeem+wallet credit (neon-http does not support db.transaction())
  - isDemoMode branch preserved with in-memory VALID_VOUCHERS — no DB call in demo mode
  - Expiry check performed before batch write to prevent crediting on expired vouchers
metrics:
  duration: 84s
  completed: "2026-04-15"
  tasks_completed: 2
  files_changed: 3
---

# Phase 20 Plan 02: Vouchers Table & API Drizzle Migration Summary

**One-liner:** Vouchers Drizzle table added to schema, SQL migration created with RLS + index, and voucher API route rewritten to use Drizzle with atomic db.batch() redeem+wallet credit.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add vouchers table to Drizzle schema + SQL migration | 174e24e | src/db/schema.ts, supabase/migrations/20260415_add_vouchers.sql |
| 2 | Rewrite voucher API route with Drizzle atomic batch redemption | 752a1ff | src/app/api/voucher/route.ts |

## What Was Built

**Task 1 — Drizzle schema + SQL migration:**
- Appended `export const vouchers = pgTable(...)` to `src/db/schema.ts` following existing timestamptz alias pattern
- Columns: id (uuid PK), code (text NOT NULL), type (text), amount (bigint satang), description (text), active (boolean default true), redeemedBy (uuid nullable), redeemedAt (timestamptz nullable), expiresAt (timestamptz nullable), createdAt (timestamptz)
- Created `supabase/migrations/20260415_add_vouchers.sql` with: CREATE TABLE IF NOT EXISTS (idempotent), UNIQUE constraint on code, CHECK constraint on type, RLS enabled, select policy for active vouchers, index on code column

**Task 2 — Voucher API route rewrite:**
- isDemoMode branch: preserved exactly — in-memory VALID_VOUCHERS, mark-used logic, same response shape
- Non-demo path: Supabase auth check → DB voucher lookup via Drizzle → active/redeemed/expiry validation → wallet fetch → atomic db.batch([update vouchers, update wallets]) → success response
- Preserves existing API contract: `{ success, voucher: { code, amount, type } }` on success; `{ error: 'invalid' }` or `{ error: 'already_used' }` on failure

## Decisions Made

- **db.batch() for atomicity:** neon-http adapter does not support db.transaction(); db.batch() provides the same atomic semantics for the two-write operation (consistent with Phase 19 pattern)
- **Expiry check before batch:** Explicit `row.expiresAt < new Date()` check prevents crediting expired vouchers even if active=true
- **isDemoMode import:** Added `import { isDemoMode } from '@/lib/demo'` to route — no behavior change in demo mode

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — voucher route wires directly to DB in non-demo mode; demo mode uses in-memory fallback intentionally.

## Self-Check: PASSED

- `src/db/schema.ts` — FOUND: `export const vouchers = pgTable`
- `supabase/migrations/20260415_add_vouchers.sql` — FOUND: `create table if not exists public.vouchers`
- `src/app/api/voucher/route.ts` — FOUND: `db.batch`, `isDemoMode`, `import { vouchers, wallets } from '@/db/schema'`
- Commits 174e24e and 752a1ff verified in git log
