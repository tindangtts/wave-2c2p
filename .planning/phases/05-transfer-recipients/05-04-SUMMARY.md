---
phase: 05-transfer-recipients
plan: "04"
subsystem: transfer-flow
tags: [confirmation, receipt, passcode, rate-timer, status-polling, vaul-drawer]
dependency_graph:
  requires: ["05-02", "05-03"]
  provides: [confirmation-page, receipt-page, rate-timer, passcode-sheet, transfer-receipt]
  affects: [transfer-flow, wallet-balance]
tech_stack:
  added: []
  patterns:
    - Vaul Drawer bottom sheet for passcode entry
    - setInterval polling with cleanup on unmount
    - Web Share API with clipboard fallback
    - Color-threshold countdown timer via useEffect + setInterval
key_files:
  created:
    - src/components/features/rate-timer.tsx
    - src/components/features/passcode-sheet.tsx
    - src/components/features/transfer-receipt.tsx
    - src/app/(main)/transfer/confirm/page.tsx
    - src/app/(main)/transfer/receipt/page.tsx
  modified: []
decisions:
  - "PasscodeSheet uses /api/auth/passcode/verify (existing endpoint) for server-side PBKDF2 verification — no client-side hash exposure"
  - "RateTimer calls onExpired which triggers re-fetch + Zustand setRate — no separate rate state outside store"
  - "ReceiptPage uses custom header (not BackHeader) to show X close button instead of back chevron"
  - "TransferReceipt convertedPya computed client-side from store values — no API round-trip needed for display"
metrics:
  duration_minutes: 3
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 05 Plan 04: Confirmation & Receipt Summary

**One-liner:** Transfer confirmation with PBKDF2 passcode sheet and receipt page with 2s status polling from pending to completed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Confirmation page with rate timer, summary, note, passcode sheet | be5d615 | rate-timer.tsx, passcode-sheet.tsx, confirm/page.tsx |
| 2 | Receipt page with status polling, receipt card, share functionality | 6163476 | transfer-receipt.tsx, receipt/page.tsx |

## What Was Built

### RateTimer (`src/components/features/rate-timer.tsx`)
- Props: `validUntil: string`, `onExpired: () => void`
- MM:SS countdown via `useEffect` + `setInterval(1000)`
- Three color states per UI-SPEC:
  - >3min: `#212121` on `bg-[#F5F5F5]`
  - 1-3min: `#FF9800` on `bg-[#FFF3E0]`, copy changes to "Rate expires soon"
  - <60s: `#F44336` on `bg-[#FFEBEE]` + `animate-pulse`
- Calls `onExpired()` when timer hits 0, cleans up interval on unmount

### PasscodeSheet (`src/components/features/passcode-sheet.tsx`)
- Vaul `Drawer` bottom sheet with `DrawerContent`
- Title: "Enter Passcode" 20px bold, subtitle: "Confirm your transfer" 12px #757575
- Reuses `PasscodeKeypad` component from Phase 2
- POSTs to `/api/auth/passcode/verify` on 6-digit completion
- 3-attempt limit: error with remaining count, auto-closes after 3 failures
- Success: calls `onVerified()`, closes sheet

### Confirmation Page (`src/app/(main)/transfer/confirm/page.tsx`)
- Guard: redirects to `/transfer/channel` if no channel/recipient in store
- Full transfer summary: amount (28px bold), converted MMK (16px), RateTimer
- Sender/Receiver card: blue-tint avatar for sender, yellow avatar for recipient
- Fee breakdown: Amount, Fee (#F44336), separator, Total (20px bold)
- Note textarea (optional, 3 rows)
- Sticky "Confirm" CTA opens PasscodeSheet
- `onVerified`: checks rate not expired → POSTs to `/api/mock-payment/process-transfer` → setTransactionId + setStatus('pending') → navigate to `/transfer/receipt`
- Wallet mutated after successful submit

### TransferReceipt (`src/components/features/transfer-receipt.tsx`)
- Props: transactionId, amount, fee, convertedPya, rate, channel, senderName, senderPhone, recipientName, recipientType, note, createdAt
- Success area: CheckCircle (48px #00C853), "Success!" badge, "2c2p WAVE" logo, formatted date
- Reference number: "Ref: {transactionId}"
- Transfer section: From/To rows with sender name, recipient name + channel label
- Amount breakdown: Amount, Fee (#F44336), Converted (MMK #757575), separator, Total (20px bold)
- Note section (conditional)
- Share button: Web Share API → clipboard fallback with sonner toast

### Receipt Page (`src/app/(main)/transfer/receipt/page.tsx`)
- Guard: redirects to `/home` if no transactionId
- Custom header with X close button (no back arrow) — terminal screen
- Status polling: `setInterval` every 2s → `GET /api/mock-payment/status/{id}`
- Pending/Processing: spinner + "Processing your transfer..." text
- Completed: full TransferReceipt card
- Failed: XCircle + "Transfer failed" + support message
- Close: reset store + mutateWallet + navigate to `/home`

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — all data sourced from Zustand transfer store populated in prior plan steps.

## Self-Check: PASSED

Files exist:
- src/components/features/rate-timer.tsx: FOUND
- src/components/features/passcode-sheet.tsx: FOUND
- src/components/features/transfer-receipt.tsx: FOUND
- src/app/(main)/transfer/confirm/page.tsx: FOUND
- src/app/(main)/transfer/receipt/page.tsx: FOUND

Commits exist:
- be5d615: FOUND
- 6163476: FOUND
