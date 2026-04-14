---
phase: "06-wallet-operations"
plan: "01"
subsystem: "wallet-data-layer"
tags: [api, zustand, swr, i18n, schemas, mock]
dependency_graph:
  requires: []
  provides:
    - "POST /api/mock-payment/topup → QR data + pending transaction"
    - "POST /api/mock-payment/withdraw → pending withdrawal transaction"
    - "GET /api/transactions → paginated transaction history with filters"
    - "useWalletOpsStore → topup/withdraw multi-step flow state"
    - "useTransactions → useSWRInfinite hook for infinite scroll history"
    - "wallet i18n namespace → en/th/mm message files"
    - "Zod schemas → topup/withdraw/channel/history-filter validation"
  affects:
    - "Phase 6 plans 02-04 (Add Money, Withdrawal, Transaction History UI)"
tech_stack:
  added:
    - "shadcn popover component"
  patterns:
    - "useSWRInfinite for paginated infinite scroll"
    - "sessionStorage Zustand persist for session-scoped flow state"
    - "setTimeout fire-and-forget for mock async completion"
key_files:
  created:
    - "src/lib/wallet/schemas.ts"
    - "src/stores/wallet-ops-store.ts"
    - "src/hooks/use-transactions.ts"
    - "src/app/api/mock-payment/topup/route.ts"
    - "src/app/api/mock-payment/withdraw/route.ts"
    - "src/app/api/transactions/route.ts"
    - "messages/en/wallet.json"
    - "messages/th/wallet.json"
    - "messages/mm/wallet.json"
    - "src/components/ui/popover.tsx"
  modified:
    - "src/i18n/request.ts"
decisions:
  - "sessionStorage (not localStorage) for wallet-ops-store — wallet flow state is session-scoped; localStorage risks stale topup/withdraw state across sessions"
  - "topup route returns QR data synchronously and fires setTimeout for mock balance update — mirrors existing mock-payment/status pattern"
  - "withdraw deducts balance immediately before async completion — prevents double-spend; rollback on tx insert failure"
  - "transactions route uses .select('*, recipients(*)') join — single query for enriched data, client avoids secondary fetch"
  - "new URL(request.url).searchParams pattern in Route Handlers — correct Web API approach; validator's await suggestion only applies to page.tsx props"
metrics:
  duration: "81 seconds"
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 10
  files_modified: 1
---

# Phase 06 Plan 01: Wallet Data Infrastructure Summary

**One-liner:** Zod schemas, Zustand session store, useSWRInfinite hook, 3 mock API routes (topup/withdraw/transactions), and tri-locale i18n messages for all wallet operations.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Schemas, store, SWR hook, i18n, shadcn installs | ce80e37 | schemas.ts, wallet-ops-store.ts, use-transactions.ts, wallet.json ×3, popover.tsx |
| 2 | Mock topup, withdrawal, transactions API routes | 13b651d | topup/route.ts, withdraw/route.ts, transactions/route.ts |

## What Was Built

**Zod Schemas (`src/lib/wallet/schemas.ts`):**
- `topupAmountSchema` — validates satang amount: min 15,000 (150 THB), max 2,500,000 (25,000 THB)
- `withdrawAmountSchema` — validates satang > 0; balance check deferred to API level
- `topupChannelSchema` — enum of 8 channels: scb, ktb, bay, bbl, kbank, gsb, service_123, cenpay
- `historyFilterSchema` — optional type/status/dateFrom/dateTo with page/limit defaults

**Zustand Store (`src/stores/wallet-ops-store.ts`):**
- `useWalletOpsStore` with topup (amount, channel) and withdraw (recipientId, amount) state
- `resetTopup` and `resetWithdraw` actions for flow teardown
- `sessionStorage` persist — session-scoped, clears on browser close

**SWR Hook (`src/hooks/use-transactions.ts`):**
- `useTransactions(filters)` using `useSWRInfinite` — 20 transactions per page
- Returns: `transactions`, `isLoading`, `isLoadingMore`, `isEmpty`, `isReachingEnd`, `size`, `setSize`, `mutate`
- Filter-aware key function — cache invalidates when filters change

**Mock API Routes:**
- `POST /api/mock-payment/topup` — validates amount+channel, creates pending tx, returns QR data (paymentCode, amount, merchantName, expiresAt), auto-completes after `MOCK_TOPUP_DELAY_MS` (default 5s)
- `POST /api/mock-payment/withdraw` — validates balance, deducts immediately, creates pending tx, auto-completes after 2s; rollback on insert failure
- `GET /api/transactions` — paginated with 6 filter params, includes recipients join

**i18n Messages:** All UI-SPEC copywriting keys covered for en/th/mm. Burmese uses Myanmar script throughout.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all API routes are fully wired to Supabase; no placeholder data.

## Self-Check: PASSED

Files exist:
- FOUND: src/lib/wallet/schemas.ts
- FOUND: src/stores/wallet-ops-store.ts
- FOUND: src/hooks/use-transactions.ts
- FOUND: src/app/api/mock-payment/topup/route.ts
- FOUND: src/app/api/mock-payment/withdraw/route.ts
- FOUND: src/app/api/transactions/route.ts
- FOUND: messages/en/wallet.json
- FOUND: messages/th/wallet.json
- FOUND: messages/mm/wallet.json
- FOUND: src/components/ui/popover.tsx

Commits exist:
- FOUND: ce80e37 (Task 1)
- FOUND: 13b651d (Task 2)

TypeScript: `npx tsc --noEmit` passes with zero errors.
