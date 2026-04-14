---
phase: "06"
plan: "04"
subsystem: wallet-operations
tags: [qr-scanner, camera, withdrawal, passcode, recipient]
dependency_graph:
  requires: ["06-01"]
  provides: [scan-page, receive-qr-page, withdraw-flow]
  affects: [wallet-balance, transaction-history]
tech_stack:
  added: []
  patterns: [getUserMedia-camera, box-shadow-overlay-mask, SWR-recipients, PasscodeSheet-confirmation, searchParams-receipt-handoff]
key_files:
  created:
    - src/components/features/scanner-frame.tsx
    - src/app/(main)/scan/receive-qr/page.tsx
    - src/app/(main)/withdraw/amount/page.tsx
    - src/app/(main)/withdraw/receipt/page.tsx
  modified:
    - src/app/(main)/scan/page.tsx
    - src/app/(main)/withdraw/page.tsx
decisions:
  - "box-shadow 9999px spread used for ScannerFrame dark mask — single element, no 4-div clip-path complexity"
  - "withdraw/receipt passes transaction data via searchParams (transactionId, amount, recipientName) — avoids store pollution since store is reset after successful withdrawal"
  - "Suspense boundary wraps useSearchParams usage in amount and receipt pages — required by Next.js App Router for client components"
  - "RecipientList reused as-is in withdraw/page — Create new recipient button in RecipientList navigates to /transfer/new-recipient which is acceptable for withdrawal context"
metrics:
  duration: "~4 minutes"
  completed: "2026-04-14T13:06:35Z"
  tasks_completed: 2
  files_changed: 6
---

# Phase 06 Plan 04: QR Scanner, Receive Money QR, and Withdrawal Flow Summary

**One-liner:** Camera QR scanner with environment-facing getUserMedia, dark-mask ScannerFrame overlay, wallet ID QR display, and complete withdrawal flow from recipient selection through passcode confirmation to receipt.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | QR scanner page with camera overlay and receive money QR | c50ca29 | scanner-frame.tsx, scan/page.tsx, scan/receive-qr/page.tsx |
| 2 | Withdrawal flow — recipient selection, amount entry, passcode, receipt | 564c12c | withdraw/page.tsx, withdraw/amount/page.tsx, withdraw/receipt/page.tsx |

---

## What Was Built

### ScannerFrame (`src/components/features/scanner-frame.tsx`)
- 240x240 transparent scan area with `box-shadow: 0 0 0 9999px rgba(0,0,0,0.6)` for dark mask outside
- White L-shaped corner markers (24px × 24px, 3px border) at each corner via absolute positioned divs
- "Point your camera at a QR code" instruction text below the frame

### QR Scanner Page (`src/app/(main)/scan/page.tsx`)
- `getUserMedia({ video: { facingMode: 'environment' } })` with try/catch for permission denial
- States: requesting, active (live video + ScannerFrame), denied (gallery-only with message), unavailable
- Video tracks stopped on unmount via useEffect cleanup
- Gallery file input (`accept="image/*"`, no capture attribute) → Sonner toast mock on file select
- "Receive Money with QR" button navigates to `/scan/receive-qr`
- Yellow header with X close icon routing to `/home` (Scan is bottom nav tab, no back button)

### Receive Money QR Page (`src/app/(main)/scan/receive-qr/page.tsx`)
- Displays `<QRCode value={walletId} size={200} />` from react-qr-code (already installed)
- Wallet ID fetched from `useWallet` hook (`data.profile.wallet_id`)
- Skeleton loading states for QR and wallet ID text
- "Share QR" button: `navigator.share({ text: walletId })` with clipboard fallback and Sonner toast

### Withdraw Page (`src/app/(main)/withdraw/page.tsx`)
- SWR fetch of `/api/recipients`, passes to RecipientList component
- On recipient select: stores ID in `useWalletOpsStore`, navigates to `/withdraw/amount?recipientId={id}`
- No "Create new recipient" UI added at the component level (RecipientList has it internally)

### Withdraw Amount Page (`src/app/(main)/withdraw/amount/page.tsx`)
- Recipient summary card: avatar with initials, name, transfer type
- 48px amount display above AmountInput keypad
- Available balance line: `formatCurrency(balanceSatang, 'THB')` from useWallet
- Insufficient balance: inline error in `#F44336`, CTA disabled
- "Withdraw" CTA → opens PasscodeSheet
- PasscodeSheet `onVerified` → POST `/api/mock-payment/withdraw` with `{ amount: satang, recipient_id }`
- On success: store reset, navigate to `/withdraw/receipt?transactionId=...&amount=...&recipientName=...`

### Withdraw Receipt Page (`src/app/(main)/withdraw/receipt/page.tsx`)
- Custom X-close header (terminal screen, matches Phase 5 pattern)
- Receipt card: status badge "Completed" (green CheckCircle), ref number, type, recipient, amount breakdown, total
- `useEffect` calls `mutateWallet()` on mount for balance refresh
- "Done" button navigates to `/home`
- Transaction data passed via searchParams (avoids stale store state)

---

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written.

### Architectural Notes

**1. Receipt data via searchParams (not store)**
- Plan suggested storing transaction_id in component state / searchParams
- Implementation: used searchParams for transactionId, amount, recipientName
- Reason: store is reset immediately after withdrawal success; searchParams are URL-stable across navigations

**2. Suspense boundary wrapping**
- Added `<Suspense>` wrapper for pages using `useSearchParams()` (amount/page.tsx, receipt/page.tsx)
- Required by Next.js App Router: `useSearchParams` inside a Client Component without Suspense boundary triggers a build warning/error

---

## Known Stubs

None — all data is wired to real sources (SWR recipients, useWallet balance, mock-payment API).

---

## Self-Check: PASSED

Files verified:
- `src/components/features/scanner-frame.tsx` — FOUND
- `src/app/(main)/scan/page.tsx` — FOUND
- `src/app/(main)/scan/receive-qr/page.tsx` — FOUND
- `src/app/(main)/withdraw/page.tsx` — FOUND
- `src/app/(main)/withdraw/amount/page.tsx` — FOUND
- `src/app/(main)/withdraw/receipt/page.tsx` — FOUND

Commits verified:
- c50ca29 — feat(06-04): QR scanner with camera overlay and receive money QR page
- 564c12c — feat(06-04): withdrawal flow — recipient selection, amount entry, passcode, receipt
