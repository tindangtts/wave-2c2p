---
phase: 11-wallet-operations
plan: "02"
subsystem: bank-accounts-api
tags: [api, bank-accounts, supabase, zod, tdd]
dependency_graph:
  requires: []
  provides: [bank-accounts-api, BankAccount-type, bank_accounts-schema]
  affects: [11-03-withdraw-bank-selector]
tech_stack:
  added: []
  patterns: [supabase-server-client, zod-v4-validation, metadata-jsonb-guard]
key_files:
  created:
    - src/app/api/bank-accounts/route.ts
    - src/app/api/bank-accounts/__tests__/route.test.ts
  modified:
    - .planning/supabase-schema.sql
    - src/types/index.ts
decisions:
  - "bank_account_id stored in transactions.metadata JSONB — avoids schema migration on transactions table; pending-withdrawal guard uses .contains() PostgREST containment operator"
metrics:
  duration_seconds: 163
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_changed: 4
requirements_satisfied: [BANK-01, BANK-02, BANK-04]
---

# Phase 11 Plan 02: Bank Accounts API Summary

**One-liner:** Bank accounts CRUD API with Zod validation and JSONB-based pending-withdrawal guard, backed by Supabase RLS.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add bank_accounts schema and BankAccount type | 9fe1e40 | .planning/supabase-schema.sql, src/types/index.ts |
| 2 | Create /api/bank-accounts route (GET, POST, DELETE) | 32ce4d1 | src/app/api/bank-accounts/route.ts, __tests__/route.test.ts |

## What Was Built

### BankAccount TypeScript Type
`src/types/index.ts` — `BankAccount` interface with `id`, `user_id`, `bank_name`, `account_number`, `account_name`, `created_at`.

### bank_accounts Schema
`.planning/supabase-schema.sql` — `create table public.bank_accounts` with UUID PK, FK to user_profiles, and 3 RLS policies (select/insert/delete scoped to `auth.uid() = user_id`).

### /api/bank-accounts Route
- **GET**: Returns `{ bank_accounts: BankAccount[] }` ordered by `created_at DESC`, empty array if none; 401 if unauthenticated.
- **POST**: Validates `bank_name` (non-empty), `account_number` (10-12 digits regex), `account_name` (non-empty) via Zod. Returns 201 `{ bank_account }` on success, 400 on validation failure.
- **DELETE**: Checks `transactions` table for `type=withdraw AND status=pending AND metadata @> {bank_account_id: id}` before delete. Returns 409 if pending withdrawal found, 200 `{ success: true }` on successful delete. RLS enforced via `.eq('user_id', user.id)` belt-and-suspenders.

### Unit Tests (TDD)
11 tests covering all 3 handlers: auth guards (401), validation rejections (400), conflict guard (409), happy paths.

## Decisions Made

**bank_account_id in metadata JSONB (not transactions column)**
- Plan direction: store `bank_account_id` in `transactions.metadata` JSONB rather than adding a column
- Avoids schema migration on the transactions table
- Pending-withdrawal check uses Supabase `.contains('metadata', { bank_account_id: id })` which maps to PostgREST `@>` JSONB containment
- Future withdraw flows must include `metadata: { bank_account_id }` when creating withdraw transactions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vi.mock hoisting issue in tests**
- **Found during:** Task 2 (TDD RED phase — tests ran but suite failed to initialize)
- **Issue:** `vi.mock` factory is hoisted to top of file by Vitest; `const mockGetUser` declarations were not yet initialized when factory ran, causing `ReferenceError: Cannot access 'mockGetUser' before initialization`
- **Fix:** Replaced top-level `const mockGetUser = vi.fn()` with `vi.hoisted(() => ({ mockGetUser: vi.fn(), mockFrom: vi.fn() }))` — ensures mock functions are created before hoist boundary
- **Files modified:** src/app/api/bank-accounts/__tests__/route.test.ts
- **Commit:** 32ce4d1

## Known Stubs

None — all handlers return real data from Supabase queries. No hardcoded empty values or placeholders.

## Self-Check: PASSED

- [x] `src/app/api/bank-accounts/route.ts` — exists
- [x] `src/app/api/bank-accounts/__tests__/route.test.ts` — exists
- [x] `.planning/supabase-schema.sql` — contains `create table public.bank_accounts`
- [x] `src/types/index.ts` — exports `BankAccount` interface
- [x] Commits 9fe1e40 and 32ce4d1 exist in git log
- [x] `npm run build` — compiled successfully
- [x] 11 vitest tests pass
