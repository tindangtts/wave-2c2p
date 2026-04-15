---
phase: 08-integration-fixes
plan: 01
subsystem: integration
tags: [navigation, i18n, cleanup, wiring]

requires:
  - phase: 04-home-wallet
    provides: bottom-nav, quick-actions components
  - phase: 05-transfer-recipients
    provides: transfer flow at /transfer/recipient
  - phase: 07-profile-card-system-states
    provides: card page at /profile/card
provides:
  - Correct navigation wiring from home to all features
  - Consistent transaction status vocabulary ('success' not 'completed')
  - Complete i18n key coverage for MM and TH locales
  - Clean route tree with no stale placeholders
affects: []

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/components/layout/bottom-nav.tsx
    - src/components/features/quick-actions.tsx
    - src/app/api/mock-payment/status/[id]/route.ts
    - src/app/(main)/transfer/receipt/page.tsx
    - src/stores/transfer-store.ts
    - messages/mm/auth.json
    - messages/th/auth.json
    - messages/mm/kyc.json
    - messages/th/kyc.json
  deleted:
    - src/app/(main)/transfer/page.tsx
    - src/app/(main)/withdrawal/page.tsx
    - src/app/(main)/card/page.tsx
    - src/app/api/mock-payment/calculate-fees/route.ts

key-decisions:
  - "TransferStatus type changed from 'completed' to 'success' to match TransactionStatus canonical type"
  - "Transfer quick action reuses qa-withdraw.png icon (both represent money movement)"
  - "Stale /transfer route deleted — /transfer/recipient is the correct entry point"

patterns-established: []

requirements-completed:
  - XFER-01
  - HOME-03
  - HOME-05
  - CARD-01
  - WTHD-01
  - XFER-08
  - HIST-02
  - EKYC-07

one_liner: "Fixed all 7 cross-phase integration gaps: navigation wiring, stale route cleanup, status vocabulary alignment, and missing i18n keys"
---

# Phase 08, Plan 01: Integration Fixes — Summary

## What Was Done

Closed all 7 integration gaps (NEW-01 through NEW-07) from the v1.0 milestone audit:

1. **NEW-01 (P0):** Changed bottom nav Transfer href from `/transfer` to `/transfer/recipient`
2. **NEW-02 (P0):** Restored Transfer as first quick action with href `/transfer/recipient`
3. **NEW-03 (P1):** Fixed Visa Card quick action href from `/visa-card` to `/profile/card`
4. **NEW-04 (P2):** Deleted stale `/withdrawal` page (real flow at `/withdraw`)
5. **NEW-05 (P2):** Aligned status vocabulary to `'success'` everywhere (was `'completed'` in status endpoint, receipt page, and TransferStatus type)
6. **NEW-06 (P3):** Added missing i18n keys: `otp.refCode` in MM/TH auth.json, `status.expired.later` and `status.expired.now` in MM/TH kyc.json
7. **NEW-07 (P3):** Deleted orphaned `/api/mock-payment/calculate-fees` route

Also deleted stale placeholder pages at `/transfer/page.tsx` and `/card/page.tsx`.

## Verification

- All 9 automated checks pass (navigation hrefs, stale file deletion, status vocabulary, i18n keys)
- `npm run build` succeeds with zero TypeScript errors
- Build output confirms `/transfer` route removed, `/transfer/recipient` present

## Files Changed

- **4 deleted:** stale /transfer, /withdrawal, /card pages + orphaned calculate-fees API
- **5 modified:** bottom-nav, quick-actions, status endpoint, receipt page, transfer store
- **4 i18n updated:** MM/TH auth.json and kyc.json

---

*Completed: 2026-04-15*
*Duration: Inline execution (no subagent)*
