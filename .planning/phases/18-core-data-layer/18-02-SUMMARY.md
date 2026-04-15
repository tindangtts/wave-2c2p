---
phase: 18-core-data-layer
plan: "02"
subsystem: data-layer
tags: [drizzle, api-routes, wallet, transactions, supabase-migration]
dependency_graph:
  requires: [18-01]
  provides: [DATA-01, DATA-02]
  affects: [api/wallet, api/transactions, api/wallet/transactions]
tech_stack:
  added: []
  patterns: [drizzle-select, leftJoin-flatten, conditions-array-filter]
key_files:
  created: []
  modified:
    - src/app/api/wallet/route.ts
    - src/app/api/transactions/route.ts
    - src/app/api/wallet/transactions/route.ts
decisions:
  - "Paginated transactions list omits recipients join — only single fetch by ID needs it (home screen and history list don't show recipient details inline)"
  - "snake_case aliases in Drizzle select (max_topup, first_name, wallet_id, created_at) preserve existing API contract consumed by client hooks"
  - "conditions array pattern with and(...conditions) chosen over chained .where() for readable multi-filter support"
  - "leftJoin result flattened to { ...row.transactions, recipients: row.recipients } to match existing Supabase nested select shape"
metrics:
  duration: ~5min
  completed: "2026-04-15"
  tasks: 2
  files: 3
---

# Phase 18 Plan 02: Drizzle API Route Migration Summary

**One-liner:** Replaced Supabase client data queries in wallet and transactions API routes with type-safe Drizzle ORM queries while keeping demo mode branches and Supabase auth intact.

## What Was Built

Three API route files migrated from `supabase.from()` calls to Drizzle ORM queries:

1. **`/api/wallet`** — Parallel `Promise.all` queries fetching wallet balance and user profile via Drizzle `select()` with snake_case column aliases to preserve the `{ wallet: { max_topup }, profile: { first_name, wallet_id } }` contract.

2. **`/api/transactions`** — Two query paths:
   - Single fetch by ID: `leftJoin(recipients)` with result flattened to `{ ...tx, recipients }` shape
   - Paginated list: conditions array built dynamically for type/status/dateFrom/dateTo filters, applied via `and(...conditions)`

3. **`/api/wallet/transactions`** — Recent 5 transactions for home screen: explicit column select with `created_at` alias, `orderBy(desc)`, `limit(5)`

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace wallet API route with Drizzle queries | c0e2570 | src/app/api/wallet/route.ts |
| 2 | Replace transactions API routes with Drizzle queries | 16917f7 | src/app/api/transactions/route.ts, src/app/api/wallet/transactions/route.ts |

## Decisions Made

- Paginated list does NOT include recipients join (only single fetch by ID needs it — reduces query cost for list views)
- snake_case column aliases preserve existing API contract: `max_topup: wallets.maxTopup`, `first_name: userProfiles.firstName`, `created_at: transactions.createdAt`
- `conditions` array with `and(...conditions)` is the idiomatic Drizzle pattern for dynamic multi-filter queries
- `leftJoin` result shape `{ transactions: {...}, recipients: {...} }` flattened to `{ ...row.transactions, recipients: row.recipients }` to match Supabase's nested-select shape

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all three routes wire to real Drizzle queries in the non-demo branch.

## Self-Check: PASSED

- src/app/api/wallet/route.ts — exists, contains `from(wallets)`, `import { db }`, `isDemoMode`
- src/app/api/transactions/route.ts — exists, contains `from(transactions)`, `leftJoin`, `isDemoMode`
- src/app/api/wallet/transactions/route.ts — exists, contains `from(transactions)`, `limit(5)`, `isDemoMode`
- Commits c0e2570 and 16917f7 exist in git log
- `supabase.from` count = 0 in all three files
