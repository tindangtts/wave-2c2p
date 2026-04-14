---
phase: 01-foundation
plan: 03
subsystem: mock-services, currency-utils, test-infrastructure
tags: [vitest, tdd, currency, mock-api, env-vars, integer-arithmetic]
dependency_graph:
  requires: []
  provides: [currency-utility, vitest-config, mock-kyc-routes, mock-payment-routes]
  affects: [all-components-using-formatCurrency, KYC-flow, transfer-flow]
tech_stack:
  added: [vitest@4.1.4, @vitejs/plugin-react]
  patterns: [integer-arithmetic-financials, env-var-driven-mocks, TDD-red-green]
key_files:
  created:
    - src/lib/currency.ts
    - src/lib/__tests__/currency.test.ts
    - vitest.config.ts
  modified:
    - src/app/api/mock-kyc/verify-document/route.ts
    - src/app/api/mock-kyc/verify-face/route.ts
    - src/app/api/mock-payment/exchange-rate/route.ts
    - src/app/api/mock-payment/calculate-fees/route.ts
    - src/app/api/mock-payment/process-transfer/route.ts
decisions:
  - "Integer arithmetic for all currency math: Math.round(satang * rate) not parseFloat chains"
  - "MOCK_KYC_AUTO_APPROVE defaults to true (not 'false') so test environments pass by default"
  - "MOCK_PAYMENT_FAIL defaults to false, MOCK_EXCHANGE_RATE_THB_MMK defaults to 58.148"
  - "Removed body.mock_fail from all routes — behavior now controlled exclusively via env vars"
metrics:
  duration: 2 minutes
  completed_date: "2026-04-14"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 5
requirements: [FOUN-06, FOUN-07, FOUN-08]
---

# Phase 01 Plan 03: Mock Services + Currency Utils + Vitest Summary

**One-liner:** Vitest TDD setup with integer-arithmetic currency utilities (satang/pya) and env-var-driven mock KYC/payment routes replacing hardcoded values and body.mock_fail params.

## What Was Built

### Task 1: Vitest + Currency Utility Module (TDD)

Installed vitest v4 with `@vitejs/plugin-react`. Created `vitest.config.ts` with node environment and `@` path alias. Built `src/lib/currency.ts` via TDD (RED confirmed — module missing, GREEN — 11/11 tests pass).

Currency module exports:
- `formatCurrency(amountInSmallestUnit, currency)` — THB: 2 decimal places via `Intl.NumberFormat`, MMK: 0 decimal places
- `convertSatangToPya(satang, rateKyatPerBaht)` — integer arithmetic: `Math.round(satang * rate)` = pya (D-07 compliant, zero `parseFloat`)
- `toSmallestUnit(displayAmount, currency)` — `Math.round(amount * 100)`
- `fromSmallestUnit(amountInSmallestUnit, currency)` — `amount / 100`

### Task 2: Mock Routes Wired to Env Vars

All 5 mock API routes updated to read configuration from environment variables at request time:

| Route | Env Vars Added |
|-------|---------------|
| mock-kyc/verify-document | `MOCK_KYC_AUTO_APPROVE` (default: true), `MOCK_KYC_DELAY_MS` (default: 1500) |
| mock-kyc/verify-face | `MOCK_KYC_AUTO_APPROVE`, `MOCK_KYC_DELAY_MS` (default: 2000) |
| mock-payment/exchange-rate | `MOCK_EXCHANGE_RATE_THB_MMK` (default: 58.148) |
| mock-payment/calculate-fees | `MOCK_EXCHANGE_RATE_THB_MMK` |
| mock-payment/process-transfer | `MOCK_PAYMENT_DELAY_MS` (default: 2000), `MOCK_PAYMENT_FAIL` (default: false), `MOCK_EXCHANGE_RATE_THB_MMK` |

KYC rejection now uses a randomized `REJECTION_REASONS` array (5 distinct messages per D-04) instead of a single hardcoded string.

## Verification

- `npx vitest run src/lib/__tests__/currency.test.ts` — 11/11 tests pass
- `grep "parseFloat" src/lib/currency.ts` — no matches
- `grep "mock_fail" src/app/api/mock-kyc/**` — no matches
- `npm run build` — all 5 mock routes compile cleanly, zero errors

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — no stub values or placeholder data in created/modified files.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `8a10bbc` | feat(01-03): install vitest and build currency utility module with TDD |
| 2 | `667d969` | feat(01-03): wire all mock routes to read behavior from env vars |

## Self-Check: PASSED

- [x] `src/lib/currency.ts` exists
- [x] `src/lib/__tests__/currency.test.ts` exists
- [x] `vitest.config.ts` exists
- [x] All 5 mock routes reference env vars
- [x] Commits `8a10bbc` and `667d969` exist in git log
- [x] `npm run build` passes
- [x] 11/11 tests pass
