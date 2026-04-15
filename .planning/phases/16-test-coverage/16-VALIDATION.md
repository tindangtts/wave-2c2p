---
phase: 16
slug: test-coverage
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-15
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 + @testing-library/react + Playwright |
| **Config file** | vitest.config.ts (existing), playwright.config.ts (new in 16-04) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run test:e2e` |
| **Estimated runtime** | ~15 seconds (unit) + ~60 seconds (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `npm test` — verify no regressions in existing 44 tests
- **After wave merge:** Run full test suite including new tests
- **Phase gate:** `npm test` passes all unit/RTL tests AND `npm run test:e2e` passes both E2E specs

---

## Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Verification Command | Automated? |
|--------|----------|-----------|---------------------|------------|
| TEST-01 | Zod schemas (auth, transfer, wallet, KYC) | Unit | `npm test -- schemas` | Yes |
| TEST-02 | Currency formatting edge cases | Unit | `npm test -- currency` | Yes |
| TEST-03 | Form components (registration, recipient, amount) | RTL | `npm test -- form` | Yes |
| TEST-04 | Registration → KYC E2E | Playwright | `npm run test:e2e -- registration` | Yes |
| TEST-05 | Transfer → receipt E2E | Playwright | `npm run test:e2e -- transfer` | Yes |

---

## Wave 0 Gaps

- [x] vitest.config.ts exists (needs upgrade with react plugin + jsdom)
- [ ] @testing-library/react not installed → Plan 16-01 installs
- [ ] playwright.config.ts does not exist → Plan 16-04 creates
- [ ] No E2E test files exist → Plans 16-04, 16-05 create

*(All gaps addressed by Phase 16 plans)*
