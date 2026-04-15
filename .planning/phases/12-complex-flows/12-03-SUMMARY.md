---
phase: 12-complex-flows
plan: "03"
subsystem: payments
tags: [visa-card, ui, multi-step-flow, passcode, alert-dialog, i18n, fx-display]
dependency_graph:
  requires:
    - 12-01 (POST /api/mock-payment/visa-card, card.request i18n keys)
  provides:
    - Visa card request UI (VISA-01 through VISA-04)
    - /profile/card/request page
  affects:
    - src/app/(main)/profile/card/page.tsx (adds Request Card CTA)
tech_stack:
  added: []
  patterns:
    - Multi-step client page (address → confirm) with useState<Step>
    - PasscodeSheet gate pattern: onVerified triggers API call
    - AlertDialog controlled mode for success/fail result modals
    - Radio-card selection with CheckCircle2 indicator (border-[#00C853])
    - FX display constants (CARD_FEE_THB, EXCHANGE_RATE, MMK_EQUIVALENT) — display-only, not sent to API
key_files:
  created:
    - src/app/(main)/profile/card/request/page.tsx
  modified:
    - src/app/(main)/profile/card/page.tsx
decisions:
  - Request Card button placed below the card info section, outside the white rounded-xl block — matches natural scroll order
  - BackHeader onBack prop used on confirm step to go back to address step (not router.back)
  - AlertDialog open prop driven by resultModal state type check — two separate AlertDialogs for success/fail for clarity
  - deliveryAddressLabel derived from selection state — confirm screen shows human-readable label, not raw enum value
metrics:
  duration: "~5 minutes"
  completed: "2026-04-15"
  tasks_completed: 2
  files_changed: 2
---

# Phase 12 Plan 03: Visa Card Request UI Summary

Visa card request flow: "Request Card" entry point on card page + multi-step /profile/card/request page implementing address selection, FX-aware payment confirmation, PasscodeSheet gate, and success/fail result modals against the mock /api/mock-payment/visa-card endpoint.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add Request Card button to existing card page | 96d88a3 | src/app/(main)/profile/card/page.tsx |
| 2 | Build Visa card request page (address → confirm → result) | f8b9809 | src/app/(main)/profile/card/request/page.tsx |

## What Was Built

### Task 1 — Request Card Button on Card Page

- Added `useRouter` and `useTranslations('profile')` imports
- Yellow rounded-full CTA button using `t('card.request.cardRequestCta')` navigating to `/profile/card/request`
- All existing reveal/freeze/auto-hide logic unchanged

### Task 2 — Visa Card Request Page

**Address selection step:**
- BackHeader with `t('card.request.title')`, onBack → router.back()
- Two radio-style cards (white bg, border-2, rounded-xl) for current/mailing address
- Selected card gets `border-[#00C853]` + CheckCircle2 green icon
- Mailing option expands inline textarea for address entry
- CTA disabled when mailing selected but text empty

**Confirmation step:**
- BackHeader with `t('card.request.confirmTitle')`, onBack → setStep('address')
- Fee summary card: card fee (200 THB), processing fee (10 THB), total (210 THB), FX rate (1 THB = 133.0 MMK), MMK equivalent (26,600 MMK)
- Delivery address display row shows selected address label
- CTA opens PasscodeSheet on tap

**PasscodeSheet → handlePayment:**
- POSTs `{ delivery_address, address_line, amount_satang: 20000, fee_satang: 1000 }` to `/api/mock-payment/visa-card`
- Success: `setResultModal({ type: 'success', cardReference: data.card_reference })`
- Failure: `setResultModal({ type: 'fail', error: data.error })`

**Result modals:**
- Success AlertDialog: shows `card_reference` in green badge, CTA navigates to `/profile/card`
- Failure AlertDialog: shows error string, CTA dismisses modal (user stays on confirm to retry)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All UI strings sourced from i18n keys (added in plan 12-01). FX constants are display-only per plan spec.

## Self-Check: PASSED

- `src/app/(main)/profile/card/page.tsx` — FOUND, contains "profile/card/request"
- `src/app/(main)/profile/card/request/page.tsx` — FOUND
- Commit `96d88a3` — FOUND
- Commit `f8b9809` — FOUND
- `npm run build` produced `/profile/card` and `/profile/card/request` routes — VERIFIED, no errors
