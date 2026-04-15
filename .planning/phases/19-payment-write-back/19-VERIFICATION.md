---
phase: 19-payment-write-back
verified: 2026-04-15T00:00:00Z
status: passed
score: 9/9 must-haves verified
---

# Phase 19: Payment Write-Back Verification Report

**Phase Goal:** Every money movement initiated through the app creates a permanent record in Supabase and updates the user's wallet balance atomically
**Verified:** 2026-04-15
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | After a successful transfer (A/C or cash pick-up), a new row in transactions with type='transfer', correct amount, fee, status='pending', and recipient_id | VERIFIED | process-transfer/route.ts line 150: `db.batch([walletUpdate, txInsert])` with type="transfer", fee, recipientId, status="pending" |
| 2 | After a successful transfer, wallet balance decreases by amount+fee atomically | VERIFIED | process-transfer/route.ts: `newBalance = wallet.balance - totalDeducted` written in same `db.batch()` as txInsert |
| 3 | After a successful P2P transfer, sender wallet decreases and receiver wallet increases atomically | VERIFIED | p2p-transfer/route.ts line 167: 3-way `db.batch([senderUpdate, receiverUpdate, txInsert])` in single Neon HTTP transaction |
| 4 | After a top-up, wallet balance increases by deposited amount and add_money transaction is created immediately (not deferred) | VERIFIED | topup/route.ts line 136: `db.batch([walletUpdate, txInsert])` with type='add_money', status='success'. No setTimeout present. |
| 5 | After a withdrawal, balance decreases and transactions row with type='withdraw' is created atomically | VERIFIED | withdraw/route.ts line 126: `db.batch([walletUpdate, txInsert])` with type='withdraw' |
| 6 | Mid-flight failure leaves wallet balance unchanged (db.batch atomicity) | VERIFIED | All four routes wrap `db.batch()` in try/catch; neon-http driver executes entire batch as one HTTP transaction — if any query fails the whole batch rolls back. Old manual rollback pattern removed. |
| 7 | No supabase.from('wallets').update calls in non-demo paths | VERIFIED | grep finds 0 matches for `supabase.from('wallets').update` across all four routes |
| 8 | No supabase.from('transactions').insert calls in non-demo paths | VERIFIED | grep finds 0 matches for `supabase.from('transactions').insert` across all four routes |
| 9 | isDemoMode branches preserved and unchanged in all four routes | VERIFIED | All four routes: isDemoMode branch present and early-returns before any Drizzle code |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/api/mock-payment/process-transfer/route.ts` | Transfer write-back via Drizzle db.batch() | VERIFIED | Imports `{ db }` from `"@/db"`, `{ wallets, transactions }` from `"@/db/schema"`. db.batch() at line 150. |
| `src/app/api/mock-payment/withdraw/route.ts` | Withdrawal write-back via Drizzle db.batch() | VERIFIED | Imports `{ db }` from `'@/db'`, `{ wallets, transactions }` from `'@/db/schema'`. db.batch() at line 126. |
| `src/app/api/mock-payment/p2p-transfer/route.ts` | P2P transfer write-back via Drizzle db.batch() | VERIFIED | Imports `{ db }` from `"@/db"`, `{ wallets, transactions }` from `"@/db/schema"`. db.batch() at line 167 — 3-query batch. |
| `src/app/api/mock-payment/topup/route.ts` | Top-up write-back via Drizzle db.batch() | VERIFIED | Imports `{ db }` from `'@/db'`, `{ wallets, transactions }` from `'@/db/schema'`. db.batch() at line 136. No setTimeout. |
| `src/db/index.ts` | Drizzle NeonHttpDatabase singleton | VERIFIED | Lazy proxy singleton using `neon()` + `drizzle()` over `NeonHttpDatabase<typeof schema>`. Supports `.batch()`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| process-transfer/route.ts | src/db/index.ts | `import { db } from "@/db"` | WIRED | Line 5 confirmed |
| process-transfer/route.ts | src/db/schema.ts | `import { wallets, transactions } from "@/db/schema"` | WIRED | Line 6 confirmed |
| withdraw/route.ts | src/db/index.ts | `import { db } from '@/db'` | WIRED | Line 5 confirmed |
| withdraw/route.ts | src/db/schema.ts | `import { wallets, transactions } from '@/db/schema'` | WIRED | Line 6 confirmed |
| p2p-transfer/route.ts | src/db/index.ts | `import { db } from "@/db"` | WIRED | Line 4 confirmed |
| p2p-transfer/route.ts | src/db/schema.ts | `import { wallets, transactions } from "@/db/schema"` | WIRED | Line 5 confirmed |
| topup/route.ts | src/db/index.ts | `import { db } from '@/db'` | WIRED | Line 6 confirmed |
| topup/route.ts | src/db/schema.ts | `import { wallets, transactions } from '@/db/schema'` | WIRED | Line 7 confirmed |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| process-transfer/route.ts | `wallet.balance` | `db.select().from(wallets).where(eq(wallets.userId, user.id))` | Yes — Drizzle query against `wallets` table | FLOWING |
| process-transfer/route.ts | `txId` | `db.batch([walletUpdate, txInsert]).returning({ id })` | Yes — inserted row id returned | FLOWING |
| withdraw/route.ts | `wallet.balance` | `db.select().from(wallets).where(eq(wallets.userId, user.id))` | Yes — Drizzle query | FLOWING |
| withdraw/route.ts | `txId` | `db.batch([walletUpdate, txInsert]).returning({ id })` | Yes — inserted row id returned | FLOWING |
| p2p-transfer/route.ts | `senderWallet`, `receiverWallet` | Two separate `db.select()` calls with `eq(wallets.userId)` and `eq(wallets.id)` | Yes — Drizzle queries | FLOWING |
| p2p-transfer/route.ts | `txId` | `db.batch([sUpdate, rUpdate, txInsert]).returning({ id })` | Yes — 3-way atomic batch | FLOWING |
| topup/route.ts | `wallet.balance` | `db.select().from(wallets).where(eq(wallets.userId, user.id))` | Yes — Drizzle query | FLOWING |
| topup/route.ts | `txId` | `db.batch([walletUpdate, txInsert]).returning({ id })` | Yes — immediate write, status='success' | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — routes require a running Supabase + Neon DB connection and an authenticated user session. Cannot be tested without a live server and real credentials. Route to human verification instead.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DATA-03 | 19-01-PLAN.md, 19-02-PLAN.md | Mock payment APIs (transfer, P2P, topup, withdraw) insert real transactions and update wallet balance in Supabase | SATISFIED | All four routes use `db.batch()` for atomic wallet+transaction writes. No Supabase data writes remain in non-demo paths. Commits ee84ade, 155ba54, 8ab251a, 69b7bf3 verified in git log. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| process-transfer/route.ts | 181 | `setTimeout` for status auto-complete | Info | Non-critical mock behavior: updates transaction status 'pending' -> 'success' after 2s. Balance already committed atomically. Background failure is caught and ignored. Same pattern in withdraw/route.ts (line 151) and p2p-transfer/route.ts (line 200). |
| topup/route.ts | 133 | Comment references "no deferred setTimeout" | Info | Correct — topup has zero setTimeout calls. The comment is accurate documentation. |

No blockers. No stubs. No empty implementations.

### Human Verification Required

#### 1. End-to-end transfer creates DB row

**Test:** Log in as a real user, initiate a transfer to a Myanmar recipient, observe the network response, then query the `transactions` table in Supabase to confirm the row exists with correct type, amount, fee, and recipient_id.
**Expected:** A row with `type='transfer'`, `status='pending'` (changing to `success` after ~2s), correct `amount` and `fee`, and the `recipient_id` matching the transfer target.
**Why human:** Requires live Supabase + Neon DB + authenticated user session.

#### 2. Top-up balance update is immediate

**Test:** Initiate a top-up, then immediately query `wallets` table. Confirm `balance` already reflects the deposit before any polling interval fires.
**Expected:** `wallet.balance` increases by `amount` (in satang) immediately in the same response cycle. No deferred update needed.
**Why human:** Requires live DB access to check timing of balance vs. prior deferred behavior.

#### 3. Mid-flight atomicity (simulated failure)

**Test:** Temporarily set `DATABASE_URL` to a broken connection string, make a transfer request, then verify wallet balance is unchanged and no orphaned transaction row exists.
**Expected:** Both wallet balance and transaction table remain unchanged. API returns 500.
**Why human:** Requires environment manipulation and DB state inspection.

### Gaps Summary

No gaps. All nine observable truths verified. All four route files are fully wired with Drizzle db.batch() for atomic writes. DATA-03 requirement satisfied. No Supabase data writes remain in non-demo paths. isDemoMode branches preserved. All four commits referenced in summaries confirmed in git history.

---

_Verified: 2026-04-15T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
