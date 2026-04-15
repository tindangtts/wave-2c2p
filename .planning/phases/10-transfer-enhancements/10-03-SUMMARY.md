---
phase: 10-transfer-enhancements
plan: "03"
subsystem: transfer
tags:
  - p2p
  - cash-pickup
  - secret-code
  - confirm
  - receipt
dependency_graph:
  requires:
    - 10-01  # P2P store (useP2PStore) and p2p-transfer API
  provides:
    - P2P confirm page (type=p2p query param routing)
    - P2P receipt page (p2p store reads)
    - TransferReceipt secret code chip for cash_pickup
  affects:
    - src/app/(main)/transfer/confirm/page.tsx
    - src/app/(main)/transfer/receipt/page.tsx
    - src/components/features/transfer-receipt.tsx
tech_stack:
  added: []
  patterns:
    - useSearchParams for flow-type detection (?type=p2p)
    - Conditional store reads (useP2PStore vs useTransferStore) based on query param
    - Suspense wrapper for client components using useSearchParams
    - aria-live="polite" for dynamic secret code updates
key_files:
  created: []
  modified:
    - src/app/(main)/transfer/confirm/page.tsx
    - src/components/features/transfer-receipt.tsx
    - src/app/(main)/transfer/receipt/page.tsx
decisions:
  - Suspense wrapper added to both confirm and receipt pages (required by useSearchParams in Next.js App Router)
  - Note field left read-only (empty) for P2P flow — P2P is wallet-to-wallet with no note routing
  - Converted row hidden in receipt for p2p channel — no FX conversion for wallet transfers
  - secretCode captured from status polling response (data.secret_code) for cash_pickup — avoids separate API call on load
metrics:
  duration_minutes: 10
  completed_date: "2026-04-15T03:52:33Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 10 Plan 03: Confirm + Receipt P2P & Secret Code Summary

**One-liner:** P2P confirm/receipt flow wired via ?type=p2p query param; cash_pickup receipt gets SECRET CODE chip with copy and refresh.

## What Was Built

### Task 1 — Confirm Page P2P Extension
`src/app/(main)/transfer/confirm/page.tsx` extended with:
- `useSearchParams()` + `isP2P` flag detection via `?type=p2p`
- Reads `useP2PStore()` when `isP2P`: `receiverWalletId`, `amountSatang`
- Guard: redirects to `/transfer/p2p` if no `receiverWalletId`
- Display changes for P2P: hides Exchange Rate row, Converted Amount row, RateTimer; adds "Type: Wallet Transfer" row with Wallet icon; shows "2C2P WAVE (P2P)" channel label
- `handleVerified` P2P path: calls `/api/mock-payment/p2p-transfer`, stores `transactionId` via `p2pStore.setTransactionId()`, navigates to `/transfer/receipt?type=p2p`
- Wrapped in `<Suspense>` as required by Next.js App Router for `useSearchParams`
- Standard A/C flow entirely unchanged

### Task 2 — TransferReceipt Secret Code Chip + Receipt Page P2P Wiring
`src/components/features/transfer-receipt.tsx` extended with:
- `secretCode?: string` added to `TransferReceiptProps`
- `displayCode` state initialized from `secretCode` prop
- `handleRefreshCode()`: POST `/api/mock-payment/refresh-secret-code`, updates `displayCode` state
- SECRET CODE chip rendered when `channel === 'cash_pickup' && displayCode`: yellow `bg-[#FFF9C4]` container, mono code with `aria-live="polite"`, Copy button (44px min, toast.success), Refresh button (44px min, disabled during refresh)
- `channelLabel` updated: `p2p` → `'2C2P WAVE (P2P)'`
- Converted row hidden for `p2p` channel in amount breakdown

`src/app/(main)/transfer/receipt/page.tsx` extended with:
- `useSearchParams()` + `isP2P` detection
- Reads `useP2PStore()` for P2P: `transactionId`, `amountSatang`, `status`, `setStatus`, `reset`, `receiverWalletId`
- P2P receipt: `fee=0`, `rate=1`, `convertedPya=0`, `recipientName=receiverWalletId`, `channel='p2p'`
- Status polling captures `data.secret_code` from response and passes to `TransferReceipt` for `cash_pickup`
- `handleClose` calls `p2pReset()` or `stdReset()` based on flow
- Wrapped in `<Suspense>`

## Deviations from Plan

None — plan executed exactly as written.

The only addition not explicitly specified was hiding the "Converted" row in the receipt for p2p channel (Rule 2: missing correctness) — showing "0 MMK" for a wallet-to-wallet transfer would be misleading.

## Known Stubs

None — all data flows are wired. `secretCode` comes from the status polling API response (`data.secret_code`) for `cash_pickup` channel. If the mock returns no `secret_code`, the chip simply does not render (guarded by `displayCode` truthiness).

## Self-Check

- [x] `src/app/(main)/transfer/confirm/page.tsx` — exists and committed (e785561)
- [x] `src/components/features/transfer-receipt.tsx` — exists and committed (35a2088)
- [x] `src/app/(main)/transfer/receipt/page.tsx` — exists and committed (35a2088)
- [x] TypeScript: 0 errors (`npx tsc --noEmit` clean)
- [x] All plan verification grep checks passed
