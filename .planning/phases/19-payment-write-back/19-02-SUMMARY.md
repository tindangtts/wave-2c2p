---
phase: 19-payment-write-back
plan: "02"
subsystem: payment-api
tags: [drizzle, atomic-writes, p2p, topup, data-consistency]
dependency_graph:
  requires: [18-02-SUMMARY.md]
  provides: [atomic-payment-writes]
  affects: [p2p-transfer-api, topup-api]
tech_stack:
  added: []
  patterns: [drizzle-db-batch, atomic-writes, neon-http-transaction]
key_files:
  created: []
  modified:
    - src/app/api/mock-payment/p2p-transfer/route.ts
    - src/app/api/mock-payment/topup/route.ts
decisions:
  - "db.batch() used for atomicity — neon-http does not support db.transaction(); db.batch() runs all queries in a single HTTP transaction"
  - "topup transaction row written with status:'success' immediately; response still returns status:'pending' for UI polling compatibility"
  - "Supabase client retained only for auth.getUser() and user_profiles read-only fetch in topup; all write paths use Drizzle"
  - "setTimeout removed from topup entirely — fire-and-forget deferred balance update was a data consistency bug; both writes now atomic"
metrics:
  duration: 151s
  completed: 2026-04-15
  tasks_completed: 2
  files_modified: 2
---

# Phase 19 Plan 02: Payment Write-Back Drizzle Migration Summary

**One-liner:** Replaced three-step Supabase write with Drizzle db.batch() in p2p-transfer, and eliminated fire-and-forget setTimeout balance update in topup with an immediate atomic db.batch().

## What Was Built

Two route files migrated from Supabase write patterns to Drizzle db.batch() atomic writes:

**p2p-transfer** (`src/app/api/mock-payment/p2p-transfer/route.ts`):
- Sender and receiver wallet fetches replaced with Drizzle `db.select()` calls
- Three separate Supabase writes (sender update, receiver update, transaction insert) + manual rollback pattern replaced with single `db.batch([senderUpdate, receiverUpdate, txInsert] as const)`
- Auto-complete setTimeout kept but updated to use Drizzle `db.update()` instead of importing a new Supabase background client
- isDemoMode branch unchanged

**topup** (`src/app/api/mock-payment/topup/route.ts`):
- Wallet fetch replaced with Drizzle `db.select()` using `eq(wallets.userId, user.id)`
- Deferred `setTimeout` pattern (insert pending transaction, then balance update after delay) replaced with immediate `db.batch([walletUpdate, txInsert] as const)`
- Transaction status is now `'success'` in DB immediately; response still returns `status:'pending'` for UI polling compatibility
- `MOCK_TOPUP_DELAY_MS` setTimeout fully removed — no deferred writes remain
- isDemoMode branch unchanged

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire p2p-transfer to Drizzle atomic batch write | 8ab251a | src/app/api/mock-payment/p2p-transfer/route.ts |
| 2 | Wire topup to Drizzle immediate atomic batch write | 69b7bf3 | src/app/api/mock-payment/topup/route.ts |

## Decisions Made

1. **db.batch() over db.transaction()** — neon-http adapter does not support `db.transaction()` (requires TCP connection state). `db.batch()` is the correct atomicity primitive for Neon HTTP.

2. **topup status:'success' in DB, status:'pending' in response** — The deferred setTimeout previously kept both DB row and wallet in a temporarily inconsistent state. With atomic writes, the DB is immediately correct. The response still returns `'pending'` so existing UI polling code continues to work without changes.

3. **Supabase client retained for auth + profile read** — `supabase.auth.getUser()` is required (Supabase Auth manages sessions). The `user_profiles` read-only fetch is kept as Supabase since it is a read and the plan explicitly allows this.

4. **setTimeout kept in p2p-transfer for status update only** — The auto-complete setTimeout in p2p-transfer updates only the transaction status to 'success' after 2s (mock behavior). This is non-critical background work and was kept with Drizzle. It does not affect data consistency (balances are already written atomically).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Both routes perform real Drizzle writes against the database.

## Verification Results

- `grep "db.batch" src/app/api/mock-payment/p2p-transfer/route.ts` — matches line 167
- `grep "db.batch" src/app/api/mock-payment/topup/route.ts` — matches line 136
- `grep -c "setTimeout(" src/app/api/mock-payment/topup/route.ts` — returns 0 (no deferred calls)
- Both files import `{ db } from '@/db'`
- Both files preserve isDemoMode branches
- `npm run build` — compiled successfully, TypeScript passed, 0 errors

## Self-Check: PASSED

Files verified:
- `src/app/api/mock-payment/p2p-transfer/route.ts` — FOUND
- `src/app/api/mock-payment/topup/route.ts` — FOUND

Commits verified:
- `8ab251a` (feat(19-02): wire p2p-transfer to Drizzle atomic batch write) — FOUND
- `69b7bf3` (feat(19-02): wire topup to Drizzle immediate atomic batch write) — FOUND
