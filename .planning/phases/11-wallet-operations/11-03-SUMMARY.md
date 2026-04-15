---
phase: 11-wallet-operations
plan: "03"
subsystem: withdraw-flow
tags: [bank-accounts, withdraw, swr, forms]
dependency_graph:
  requires: [11-02]
  provides: [withdraw-bank-account-selector, add-bank-form, withdraw-amount-bank-account, withdraw-api-bank-account-id]
  affects: [withdraw-flow, bank-account-management]
tech_stack:
  added: []
  patterns: [swr-hook, react-hook-form-zod, alert-dialog-delete-confirm]
key_files:
  created:
    - src/hooks/use-bank-accounts.ts
    - src/app/(main)/withdraw/add-bank/page.tsx
  modified:
    - src/app/(main)/withdraw/page.tsx
    - src/app/(main)/withdraw/amount/page.tsx
    - src/app/api/mock-payment/withdraw/route.ts
    - src/stores/wallet-ops-store.ts
decisions:
  - "Withdraw page fully replaces recipient list with bank account list — no backward compat needed for UI since users withdraw to their own accounts"
  - "bank_account_id stored in transactions.metadata JSONB (no schema migration) — enables pending-withdrawal guard from Plan 02"
  - "withdraw API uses .refine() to require either recipient_id or bank_account_id — backward compat with any legacy callers"
metrics:
  duration_seconds: 179
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_modified: 6
---

# Phase 11 Plan 03: Withdraw Bank Account Flow Summary

**One-liner:** Replaced recipient selector in withdraw flow with bank account selector — SWR hook, add-bank form, amount page, and API all updated to use bank_account_id stored in transaction metadata JSONB.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | SWR hook + withdraw page rework + add-bank form | 479a2b2 | use-bank-accounts.ts, withdraw/page.tsx, withdraw/add-bank/page.tsx |
| 2 | Update withdraw amount page + withdraw API to use bank_account_id | 6e2f210 | withdraw/amount/page.tsx, mock-payment/withdraw/route.ts, wallet-ops-store.ts |

## What Was Built

### Task 1: SWR Hook + Withdraw Page + Add-Bank Form

**`src/hooks/use-bank-accounts.ts`**
- SWR hook fetching `/api/bank-accounts` with 10s deduping interval
- Returns `{ bank_accounts: BankAccount[] }` typed response

**`src/app/(main)/withdraw/page.tsx`** (full rewrite)
- Bank account list with skeleton loading and empty state
- "+ Add Bank Account" dashed-border button navigating to `/withdraw/add-bank`
- `BankAccountRow` inline component: shows bank name + masked account number (`****XXXX`), account name, trash icon
- Delete confirmation `AlertDialog` — controlled via `deletingId` state
- `handleDelete`: fetches `DELETE /api/bank-accounts?id=...`, handles 409 with specific toast error, calls `mutate()` on success

**`src/app/(main)/withdraw/add-bank/page.tsx`** (new)
- react-hook-form + zod validation schema
- Bank name `Select` with 10 Thai bank options (SCB, KBank, BBL, KTB, BAY, GSB, CIMB, TMB, UOB, LH Bank)
- Account number `Input` with `type="tel"` `inputMode="numeric"` regex validation `/^\d{10,12}$/`
- Account name `Input` text field
- `POST /api/bank-accounts` on submit → success redirects to `/withdraw`, error shows toast

### Task 2: Amount Page + API + Store Updates

**`src/app/(main)/withdraw/amount/page.tsx`** (rewrite)
- Reads `bankAccountId` from `useSearchParams()` instead of `recipientId`
- Fetches bank accounts via `useBankAccounts()` hook, finds matching account by ID
- Bank account summary card: blue circle avatar with 3-char bank abbreviation, bank name + masked account number
- POST body now sends `{ amount, bank_account_id }` instead of `{ amount, recipient_id }`
- Receipt navigation uses `bankAccount.account_name` as `recipientName` param

**`src/app/api/mock-payment/withdraw/route.ts`** (updated)
- Schema extended: `recipient_id` and `bank_account_id` both optional, `.refine()` requires at least one
- Bank account path: verifies ownership via `bank_accounts` table, builds description with bank name + account name
- Builds `metadata = { bank_account_id }` when bank_account_id provided
- Inserts transaction with `metadata` column — enables the Plan 02 pending-withdrawal DELETE guard

**`src/stores/wallet-ops-store.ts`** (updated)
- Added `withdrawBankAccountId: string | null` to state and `initialState`
- Added `setWithdrawBankAccount` action
- `resetWithdraw` now also resets `withdrawBankAccountId`
- `partialize` includes `withdrawBankAccountId` for session persistence

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data is wired to real API endpoints created in Plan 02.

## Self-Check: PASSED

Files exist:
- FOUND: src/hooks/use-bank-accounts.ts
- FOUND: src/app/(main)/withdraw/add-bank/page.tsx
- FOUND: src/app/(main)/withdraw/page.tsx
- FOUND: src/app/(main)/withdraw/amount/page.tsx
- FOUND: src/app/api/mock-payment/withdraw/route.ts
- FOUND: src/stores/wallet-ops-store.ts

Commits exist:
- FOUND: 479a2b2 (Task 1)
- FOUND: 6e2f210 (Task 2)

Build: 0 TypeScript errors.
