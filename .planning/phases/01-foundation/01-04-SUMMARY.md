---
phase: 01-foundation
plan: "04"
subsystem: database
tags: [supabase, postgresql, rls, bigint, satang, pya, monetary]

# Dependency graph
requires: []
provides:
  - "Corrected Supabase schema with bigint monetary columns (satang/pya integer storage)"
  - "Complete RLS policies: INSERT on user_profiles, UPDATE on wallets"
  - "Monetary convention documented at top of schema (D-07)"
affects: [auth, payments, transfer, wallet, kyc]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Monetary storage: bigint satang/pya (integer arithmetic, no IEEE 754 float errors)"
    - "RLS policies use auth.uid() only — never user_metadata"

key-files:
  created: []
  modified:
    - ".planning/supabase-schema.sql"

key-decisions:
  - "All monetary columns use bigint (satang/pya) per D-07 — prevents 100x display errors from float-to-integer mismatch"
  - "exchange_rate stays as numeric(10,4) — it is a ratio, not a currency amount"
  - "INSERT policy added to user_profiles — required for registration flow"
  - "UPDATE policy added to wallets — explicit is safer than relying solely on service role bypass"

patterns-established:
  - "Monetary storage: 1 THB = 100 satang (bigint), 1 MMK = 100 pya (bigint)"
  - "Exchange rates: numeric(10,4) — not integer, not a currency amount"
  - "RLS pattern: auth.uid() = id (user_profiles) or auth.uid() = user_id (all other tables)"

requirements-completed: [FOUN-04]

# Metrics
duration: 5min
completed: 2026-04-14
---

# Phase 01 Plan 04: Supabase Schema Integer Monetary Columns and RLS Policies Summary

**Supabase schema corrected from numeric(12,2) float columns to bigint satang/pya storage with complete RLS policies (INSERT on user_profiles, UPDATE on wallets)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-14T06:53:49Z
- **Completed:** 2026-04-14T06:54:42Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Fixed all 7 monetary columns from numeric(12,2)/numeric(8,2) to bigint — prevents the 100x arithmetic mismatch between float storage and satang/pya integer convention (D-07)
- Added INSERT policy on user_profiles — without this, the registration flow would fail with RLS violation at the moment a new user's profile is created
- Added UPDATE policy on wallets — explicit policy is safer than relying solely on service role RLS bypass
- Documented D-07 monetary convention as a comment block at the top of the schema for all future developers

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix monetary columns to bigint and add missing RLS policies** - `cc8ca23` (fix)

**Plan metadata:** TBD (docs: complete plan metadata)

## Files Created/Modified
- `.planning/supabase-schema.sql` - Fixed monetary columns and added RLS policies

## Decisions Made
- Kept `exchange_rate` as `numeric(10,4)` — exchange rates are ratios (e.g., 58.1480 THB/USD), not currency amounts. Converting them to integers would require an arbitrary scale factor and make the column semantics ambiguous.
- Chose `bigint default 2500000` for `max_topup` (25,000 THB × 100 satang = 2,500,000 satang) — directly encodes the regulatory limit in the smallest unit, no calculation needed at read time.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. The schema had not been deployed yet (project at 0% progress), so the type changes are schema creation fixes with zero migration cost.

## User Setup Required

None - schema is a SQL file that users run manually in Supabase SQL Editor. No environment variables required for this task.

## Next Phase Readiness
- Schema is ready for deployment via Supabase SQL Editor (run `.planning/supabase-schema.sql`)
- All downstream phases (auth, wallet, transfer, KYC) can now safely write satang/pya integers to the database without type mismatch
- `src/lib/currency.ts` (plan 01-08 or similar) must implement `formatCurrency(amountInSmallestUnit, currency)` to convert bigint DB values to display strings

## Self-Check: PASSED

- FOUND: `.planning/supabase-schema.sql`
- FOUND: `.planning/phases/01-foundation/01-04-SUMMARY.md`
- FOUND: commit `cc8ca23`
- bigint count: 8 (>= 7 required)
- numeric(12,2) count: 0
- numeric(8,2) count: 0

---
*Phase: 01-foundation*
*Completed: 2026-04-14*
