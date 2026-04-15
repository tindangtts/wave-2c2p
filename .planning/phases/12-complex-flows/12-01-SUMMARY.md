---
phase: 12-complex-flows
plan: "01"
subsystem: payments
tags: [api, mock, visa-card, i18n, payments]
dependency_graph:
  requires: []
  provides:
    - POST /api/mock-payment/visa-card
    - card.request i18n keys (en/th/mm)
  affects:
    - src/app/(main)/profile/card (consumed by plan 12-03)
tech_stack:
  added: []
  patterns:
    - Mock payment endpoint pattern (auth + env-configurable fail + balance deduction + tx insert)
    - Integer satang arithmetic throughout
key_files:
  created:
    - src/app/api/mock-payment/visa-card/route.ts
  modified:
    - messages/en/profile.json
    - messages/th/profile.json
    - messages/mm/profile.json
decisions:
  - Passed amount_satang + fee_satang from client (not hardcoded server-side) per plan spec — server only validates and deducts
  - Rollback wallet balance on transaction insert failure, consistent with process-transfer pattern
  - No zod validation on mock endpoint body — matches existing mock API convention
metrics:
  duration: "~2 minutes"
  completed: "2026-04-15"
  tasks_completed: 2
  files_changed: 4
---

# Phase 12 Plan 01: Mock Visa Card API + I18n Summary

Mock Visa card payment endpoint with auth guard, env-configurable failure, wallet balance deduction, and transaction record insertion; plus all 14 i18n keys for the Visa card request flow in en/th/mm locales.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create POST /api/mock-payment/visa-card route | c2d62c0 | src/app/api/mock-payment/visa-card/route.ts |
| 2 | Add Visa card request i18n strings to all 3 locales | 64a5bc3 | messages/en/profile.json, messages/th/profile.json, messages/mm/profile.json |

## What Was Built

### Task 1 — POST /api/mock-payment/visa-card

Route handler at `src/app/api/mock-payment/visa-card/route.ts`:

- Auth guard: `createClient()` → `supabase.auth.getUser()` → 401 if no session
- Input validation: `delivery_address` must be `'current'` or `'mailing'` → 400 if missing/invalid
- Env-configurable failure: `MOCK_PAYMENT_FAIL=true` returns `{ success: false, error: "..." }`
- Balance check: fetches wallet, validates `balance >= amount_satang + fee_satang` → 400 Insufficient balance
- Balance deduction: integer arithmetic (`wallet.balance - totalSatang`)
- Transaction insert: `type: 'card_payment', status: 'success'`
- Rollback: restores wallet balance if transaction insert fails
- Success response: `{ success: true, card_reference: "VISA-{timestamp}", delivery_address, estimated_delivery: "5-7 business days" }`
- Try/catch wrapping entire handler → 500 on unexpected errors

### Task 2 — I18n Keys

Added `card.request.*` namespace inside the `card` object in all 3 locale files:

Keys added (14 per locale):
`title`, `subtitle`, `currentAddress`, `mailingAddress`, `addressPlaceholder`, `confirmTitle`, `fee`, `feeValue`, `cardFee`, `cardFeeValue`, `total`, `fxRate`, `youReceive`, `confirmCta`, `successTitle`, `successBody`, `successCta`, `failTitle`, `failBody`, `failCta`, `cardRequestCta`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The API route is fully functional (mock). I18n strings are complete.

## Self-Check: PASSED

- `src/app/api/mock-payment/visa-card/route.ts` — FOUND
- Commit `c2d62c0` — FOUND
- Commit `64a5bc3` — FOUND
- All 3 `profile.json` files parse as valid JSON — VERIFIED
- `card.request` keys present in en/th/mm — VERIFIED
