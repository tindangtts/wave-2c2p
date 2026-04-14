---
phase: 06-wallet-operations
plan: "02"
subsystem: wallet-ui
tags: [add-money, qr-code, topup, timer, bank-channels]
dependency_graph:
  requires: [06-01]
  provides: [add-money-page, qr-page, bank-channel-grid, convenience-channel-list, qr-display, qr-expiry-timer]
  affects: [wallet-balance]
tech_stack:
  added: [react-qr-code]
  patterns: [countdown-timer, color-threshold, mock-api-post-on-mount, swr-mutate-on-done]
key_files:
  created:
    - src/components/features/bank-channel-grid.tsx
    - src/components/features/convenience-channel-list.tsx
    - src/components/features/qr-display.tsx
    - src/components/features/qr-expiry-timer.tsx
    - src/app/(main)/add-money/qr/page.tsx
  modified:
    - src/app/(main)/add-money/page.tsx
    - package.json
decisions:
  - "Channel tap with invalid amount shows toast error instead of silently ignoring (better UX)"
  - "hasFetched ref prevents double-POST in React Strict Mode / dev double-render"
  - "Generate New QR reuses same fetch logic inline (no abstraction — simple enough)"
  - "amount from topup API is in baht (not satang) — multiply by 100 for formatCurrency"
metrics:
  duration_minutes: 4
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 5
  files_modified: 2
---

# Phase 6 Plan 02: Add Money Flow — QR Code UI Summary

**One-liner:** Add Money flow with bank/convenience channel selection, react-qr-code SVG display, and MM:SS expiry countdown with color thresholds.

## What Was Built

### Task 1: Add Money page + channel components
- **`BankChannelGrid`** — 3x2 grid of 6 banks (SCB, KTB, Bay, BBL, KBANK, GSB) with colored placeholder icons (colored bg + abbreviation text). Each button 88x72px per UI-SPEC.
- **`ConvenienceChannelList`** — 123 Service + CenPay rows (56px height) with colored round icon and ChevronRight. Bordered card with internal separator.
- **`AddMoneyPage`** (rewritten) — BackHeader, wallet balance + max top-up display (12px #757575), AmountInput numpad, min/max validation captions (#F44336), channel sections with headings. Channel tap with invalid amount shows toast error.

### Task 2: QR display page + timer components
- **`QRExpiryTimer`** — MM:SS countdown from `expiresAt` ISO string. Color thresholds: >5min = #212121, 1–5min = #FF9800, <60s = #F44336. Calls `onExpired` on zero. Cleans up interval on unmount.
- **`QRDisplay`** — White card (rounded-2xl, shadow-md). 2C2P WAVE logo placeholder, merchant name, `react-qr-code` SVG (200x200), payment code + amount row, divider, "Please pay before HH:MM". QR dims (`opacity-40`) when expired.
- **`/add-money/qr` page** — POSTs to `/api/mock-payment/topup` on mount (hasFetched ref prevents double-call). Loading spinner while awaiting. Expired state: hides timer, shows QR expired message + "Generate New QR" yellow CTA. "Done" calls `mutateWallet()` + navigates to `/add-money`.

## Key Links

| From | To | Via |
|------|----|-----|
| `/add-money` channel tap | `/add-money/qr?channel=X&amount=Y` | `router.push` with satang amount |
| `/add-money/qr` page mount | `/api/mock-payment/topup` | `fetch POST` |
| QRDisplay | `react-qr-code` | `<QRCode value={paymentCode} size={200} />` |

## Decisions Made

1. Channel tap with invalid amount shows toast error (not silent ignore) — clearer UX feedback.
2. `hasFetched` ref prevents double-POST in React Strict Mode dev double-renders.
3. Amount from topup API response is in baht (not satang) — multiply by 100 before `formatCurrency`.
4. "Generate New QR" replaces only the primary CTA when expired; "Done" always stays visible.

## Deviations from Plan

### Auto-adjusted

**1. [Rule 2 - UX] Channel tap with invalid amount shows toast**
- **Found during:** Task 1 implementation
- **Issue:** Plan note said "tapping channel when amount invalid shows error toast" — implemented exactly this
- **Fix:** Toast with specific message (no amount → "enter amount first", below min → belowMinimum, above max → aboveMaximum)
- **Files modified:** `src/app/(main)/add-money/page.tsx`

**2. [Rule 2 - Correctness] hasFetched ref to prevent double-POST**
- **Found during:** Task 2 implementation
- **Issue:** React Strict Mode in dev causes double useEffect execution, which would create duplicate transactions
- **Fix:** `useRef(false)` guard on the fetch effect
- **Files modified:** `src/app/(main)/add-money/qr/page.tsx`

## Known Stubs

None. All components wire live data:
- Balance from `useWallet()` SWR hook
- QR data from POST to `/api/mock-payment/topup`
- Channel and amount from query params (passed from Add Money page)

## Self-Check: PASSED

- `src/components/features/bank-channel-grid.tsx` — exists
- `src/components/features/convenience-channel-list.tsx` — exists
- `src/components/features/qr-display.tsx` — exists
- `src/components/features/qr-expiry-timer.tsx` — exists
- `src/app/(main)/add-money/qr/page.tsx` — exists
- Task 1 commit: add5da6
- Task 2 commit: e13579e
- `npx tsc --noEmit` — PASSED (no errors)
