---
phase: 19-payment-write-back
plan: "01"
subsystem: api/payment
tags: [drizzle, atomic, transactions, wallets, payment]
dependency_graph:
  requires: [18-02]
  provides: [atomic-payment-write-back]
  affects: [process-transfer, withdraw]
tech_stack:
  added: []
  patterns: [drizzle-db-batch, atomic-write]
key_files:
  created: []
  modified:
    - src/app/api/mock-payment/process-transfer/route.ts
    - src/app/api/mock-payment/withdraw/route.ts
decisions:
  - db.batch() used instead of db.transaction() — neon-http driver does not support transaction()
  - Supabase retained only for auth (getUser) and non-Drizzle-schema tables (recipients, bank_accounts)
  - isDemoMode branches left fully unchanged as required
metrics:
  duration: 117s
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_modified: 2
---

# Phase 19 Plan 01: Payment Write-Back Summary

**One-liner:** Replaced sequential Supabase wallet-update + transaction-insert + manual rollback patterns with atomic Drizzle `db.batch()` in both process-transfer and withdraw routes.

## What Was Built

Both `process-transfer/route.ts` and `withdraw/route.ts` non-demo write paths now use Drizzle ORM for all wallet and transaction data writes. The wallet balance fetch, wallet update, and transaction insert are now wrapped in a single `db.batch()` call, which the neon-http driver executes atomically in one HTTP transaction. The previous pattern used separate Supabase calls with a manual rollback on failure — this was non-atomic: a rollback failure would leave the wallet decremented with no transaction record.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire process-transfer to Drizzle atomic batch write | ee84ade | src/app/api/mock-payment/process-transfer/route.ts |
| 2 | Wire withdraw to Drizzle atomic batch write | 155ba54 | src/app/api/mock-payment/withdraw/route.ts |

## Decisions Made

- `db.batch()` is the correct atomicity primitive for the neon-http driver — `db.transaction()` is not supported by this driver
- Supabase `createClient()` is retained in both routes exclusively for `supabase.auth.getUser()` (auth check) — no data reads/writes go through Supabase in the non-demo path
- `recipients` and `bank_accounts` table lookups in withdraw remain via Supabase because those tables are not yet in the Drizzle schema (added in Phase 20)
- `isDemoMode` branches left entirely untouched — preserving all demo behavior

## Verification

All acceptance criteria passed:

- `grep "from '@/db'"` (or `"@/db"`) matches in both files
- `grep "db.batch"` matches in both files
- `grep "isDemoMode"` matches in both files (branch preserved)
- No `supabase.from('wallets').update` in non-demo path of either file
- `npm run build` exits 0 with no TypeScript errors

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both routes are fully wired.

## Self-Check: PASSED
