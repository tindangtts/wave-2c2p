---
phase: 11-wallet-operations
plan: 01
subsystem: payments
tags: [react-barcode, topup, convenience-store, barcode, i18n, mock-payment]

# Dependency graph
requires:
  - phase: 06-wallet-operations
    provides: topup flow with QR page, topup API route, wallet-ops-store, QRExpiryTimer component

provides:
  - 123 Service convenience store top-up channel at /add-money/123-service
  - Extended POST /api/mock-payment/topup returning barcode_data for service_123 channel
  - Code 128 barcode screen with Ref.1 (wallet_id), Ref.2 (reference), amount, pay-before timer
  - i18n strings for 123 Service screen in en/th/mm locales

affects:
  - add-money flow
  - wallet-operations
  - convenience-store-channels

# Tech tracking
tech-stack:
  added:
    - react-barcode v1.6.1 (Code 128 SVG barcode rendering)
  patterns:
    - hasFetched ref guard for React Strict Mode double-invoke prevention (same as QR page)
    - Channel-branched API response shape: barcode_data for service_123, qr_data for all others
    - QRExpiryTimer reused for barcode expiry countdown

key-files:
  created:
    - src/app/(main)/add-money/123-service/page.tsx
  modified:
    - src/app/api/mock-payment/topup/route.ts
    - src/app/(main)/add-money/page.tsx
    - messages/en/wallet.json
    - messages/th/wallet.json
    - messages/mm/wallet.json

key-decisions:
  - "react-barcode chosen for Code 128 SVG output — zero extra dependencies, simple React API, same barcode format used by Thai convenience store POS terminals"
  - "barcode_data returned only for service_123 channel; qr_data returned for all other channels — no breaking change to existing QR flow"
  - "expiresAt set to 30 min for service_123 (store transactions need cashier processing time) vs 15 min for QR channels"
  - "barcodeValue derived from referenceNumber digits only, padStart(20) — ensures valid CODE128 numeric barcode for POS scanning"

patterns-established:
  - "Channel-specific response branching in topup API: check channel before return, return different shape per channel type"
  - "Reuse QRExpiryTimer for any timed payment code screen — not just QR codes"

requirements-completed:
  - TOPUP-01
  - TOPUP-02

# Metrics
duration: 8min
completed: 2026-04-15
---

# Phase 11 Plan 01: 123 Service Top-up Summary

**Code 128 barcode top-up screen for 123 Service convenience stores using react-barcode, with Ref.1/Ref.2 refs, 30-minute expiry timer, and regenerate flow**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-15T04:11:00Z
- **Completed:** 2026-04-15T04:19:20Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Extended topup API to return `barcode_data` shape (barcodeValue, ref1, ref2, amount, expiresAt) for `service_123` channel while keeping `qr_data` shape unchanged for all other channels
- Created `/add-money/123-service` page with Code 128 SVG barcode, Ref.1 (wallet_id from user_profiles), Ref.2 (reference number), amount in THB, pay-before timestamp, expiry countdown, and regenerate flow
- Updated `handleChannelSelect` in add-money page to route `service_123` to `/add-money/123-service` instead of the QR page
- Added `topup123Service`, `barcodeExpired`, `generateNewBarcode` i18n keys to all three locale files (en/th/mm)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install react-barcode and extend topup API** - `83ddf60` (feat)
2. **Task 2: Create 123-service barcode page + routing + i18n** - `d8c05e3` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/app/(main)/add-money/123-service/page.tsx` - New 123 Service barcode display screen
- `src/app/api/mock-payment/topup/route.ts` - Extended with service_123 branch returning barcode_data; wallet_id fetch; 30min expiry for service_123
- `src/app/(main)/add-money/page.tsx` - handleChannelSelect routes service_123 to /add-money/123-service
- `messages/en/wallet.json` - Added topup123Service, barcodeExpired, generateNewBarcode
- `messages/th/wallet.json` - Added Thai translations for same keys
- `messages/mm/wallet.json` - Added Myanmar translations for same keys
- `package.json` / `package-lock.json` - react-barcode v1.6.1 added

## Decisions Made

- react-barcode chosen for Code 128 SVG output — zero extra dependencies, simple React API (`<Barcode value={...} format="CODE128" />`), same barcode format used by Thai convenience store POS terminals
- `barcode_data` returned only for `service_123` channel; `qr_data` returned for all other channels — maintains backward compatibility with the existing QR top-up flow
- `expiresAt` set to 30 minutes for `service_123` vs 15 minutes for QR channels — store transactions require more time for cashier processing
- `barcodeValue` is digits-only from referenceNumber, padded to 20 characters — ensures valid CODE128 numeric barcode that POS scanners can read

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 123 Service top-up channel is fully functional — tapping the channel on the add-money screen navigates to /add-money/123-service, generates a barcode from the API, displays Ref.1/Ref.2/amount/pay-before, and handles expiry with regeneration
- Ready to proceed to Phase 11 Plan 02

---
*Phase: 11-wallet-operations*
*Completed: 2026-04-15*
