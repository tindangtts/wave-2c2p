---
phase: 20-new-tables-seed
plan: "03"
subsystem: database
tags: [seed, sql, demo-data, schema]
dependency_graph:
  requires: [20-01, 20-02]
  provides: [supabase/seed.sql, .planning/supabase-schema.sql]
  affects: [all-app-screens, developer-onboarding]
tech_stack:
  added: []
  patterns: [fixed-uuid-seed, satang-bigint, on-conflict-idempotency]
key_files:
  created:
    - supabase/seed.sql
  modified:
    - .planning/supabase-schema.sql
decisions:
  - Fixed UUIDs (00000000-0000-0000-0000-0000000000XX) chosen for idempotent seed re-runs
  - auth.users prerequisite documented in file header (user_profiles.id is FK to auth.users)
  - Hard-coded reference numbers SEED-TXN-001..005 satisfy transactions.reference_number UNIQUE constraint
  - Vouchers seeded without redeemed_by (unredeemed) so all three codes are usable after seed
metrics:
  duration: 103s
  completed: "2026-04-15T12:01:41Z"
  tasks_completed: 2
  files_changed: 2
---

# Phase 20 Plan 03: Seed SQL + Schema Update Summary

**One-liner:** Idempotent seed.sql inserts demo data for all 8 tables using fixed UUIDs and satang amounts; supabase-schema.sql updated as single DDL source of truth with Phase 20 notifications/vouchers DDL.

## What Was Built

### Task 1 — supabase/seed.sql

Created `supabase/seed.sql` with comprehensive demo data:

| Table | Rows | Key data |
|-------|------|----------|
| user_profiles | 1 | Lalita Tungtrakul, +66992345678, kyc_status approved |
| wallets | 1 | 1,000,000 satang (10,000 THB), wallet_id WAVE-8989-9890 |
| recipients | 3 | Min Zaw (wave_app, fav), Sam Smith (bank), Vy Savanntepy (cash) |
| transactions | 5 | add_money×2, send_money×2, withdraw×1; statuses: success/rejected/pending |
| cards | 1 | **** **** **** 8989, active, 250,000 satang balance |
| bank_accounts | 2 | SCB and KTB accounts |
| notifications | 4 | transfer/topup (unread), referral/system (read) |
| vouchers | 3 | WAVE2024 (5,000 sat), NEWYEAR (10,000 sat), FREETX (free_transfer) |

All inserts use `ON CONFLICT DO NOTHING` — seed is safe to re-run against a populated DB.

### Task 2 — .planning/supabase-schema.sql

Appended Phase 20 DDL to `.planning/supabase-schema.sql`:
- `public.notifications` table with RLS (select + update own) and composite index on (user_id, created_at desc)
- `public.vouchers` table with RLS (select active) and index on code
- Both DDL blocks match exactly what is in the migration files (20260415_add_notifications.sql, 20260415_add_vouchers.sql)

## Decisions Made

1. **Fixed UUIDs** — Pattern `00000000-0000-0000-0000-0000000000XX` used so seed rows are stable across runs. ON CONFLICT DO NOTHING prevents duplicate errors.
2. **auth.users prerequisite** — Documented in seed.sql header with the exact INSERT statement developers must run first (user_profiles.id is a FK to auth.users; seed will fail otherwise).
3. **Hard-coded reference numbers** — SEED-TXN-001 through SEED-TXN-005 satisfy the UNIQUE constraint on transactions.reference_number without relying on random() which would create new rows on re-run.
4. **Unredeemed vouchers** — All three vouchers seeded with redeemed_by = null so they are immediately usable after seed for testing the voucher redemption flow.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — seed data is complete and covers all app screens.

## Self-Check: PASSED
