---
phase: 16-test-coverage
plan: 05
subsystem: testing
tags: [playwright, e2e, transfer, demo-mode]

# Dependency graph
requires: [16-04]
provides:
  - src/e2e/transfer.spec.ts with 1 E2E test covering transfer confirmation -> receipt flow
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getByRole('button', { name: 'Next', exact: true }) — exact match required to avoid Next.js Dev Tools button"
    - "Status polling via receipt page: /api/mock-payment/status/:id progresses to success after 3000ms"
    - "DEMO_MODE passcode: any valid 6-digit code accepted at /api/auth/passcode/verify"
    - "Pre-seeded DEMO_RECIPIENTS used for recipient selection (Min Zaw, wave_app type)"

key-files:
  created:
    - src/e2e/transfer.spec.ts
  modified:
    - .gitignore

key-decisions:
  - "Exact button name match ('Next', exact: true) required — Next.js Dev Tools injects a button with aria-label containing 'next' in dev mode"
  - "Passcode entry uses .last() qualifier for digit buttons — both AmountInput and PasscodeKeypad render digit buttons; last() targets the visible passcode keypad"
  - "Receipt verification checks for 'Transaction Detail' header (title_receipt translation key) and 'Close' button rather than /receipt/i text (which doesn't appear in the rendered UI)"
  - "test-results/ and playwright-report/ added to .gitignore (generated Playwright output)"

requirements-completed: [TEST-05]

# Metrics
duration: 90s
completed: 2026-04-15
---

# Phase 16 Plan 05: Transfer E2E Test Summary

**Transfer confirmation -> receipt E2E test: 1 passing test covers select recipient, enter amount, select channel, confirm with passcode, and reach receipt — all in ~4s with DEMO_MODE=true**

## Performance

- **Duration:** ~90s
- **Started:** 2026-04-15T07:44:00Z
- **Completed:** 2026-04-15T07:46:47Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Created `src/e2e/transfer.spec.ts` with 1 E2E test
- Test covers the full transfer happy path: home -> recipient -> amount -> channel -> confirm -> passcode -> receipt
- Test passes in ~4s using DEMO_MODE pre-seeded data and mock APIs
- Added `test-results/` and `playwright-report/` to `.gitignore`

## Task Commits

1. **Task 1: Transfer confirmation -> receipt E2E test** - `389717a` (feat)
2. **[Rule 2 - Missing] Add test-results to .gitignore** - `81fc226` (chore)

## Files Created/Modified

- `src/e2e/transfer.spec.ts` - Transfer flow E2E test (122 lines, 1 test)
- `.gitignore` - Added test-results/ and playwright-report/ entries

## Decisions Made

- **Exact button name matching**: Next.js 16 dev mode injects a "Next.js Dev Tools" button into every page. Using `/next/i` regex matched both the app's "Next" CTA and the dev tools button, causing a strict-mode locator violation. Fixed by using `{ name: 'Next', exact: true }`.

- **Passcode keypad `.last()` qualifier**: Both the AmountInput keypad (on /transfer/amount) and the PasscodeKeypad (in the passcode sheet) render digit buttons `1-9`. When the passcode drawer is open, both sets of buttons are in the DOM. Using `.last()` for digit button clicks during passcode entry targets the passcode keypad reliably.

- **Receipt verification strategy**: The receipt page header text comes from the `title_receipt` translation key = "Transaction Detail". The `/receipt/i` pattern doesn't appear anywhere in the rendered receipt page UI. Test now verifies `getByText('Transaction Detail')` and `getByRole('button', { name: 'Close', exact: true })`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Next.js Dev Tools button matched /next/i regex**
- **Found during:** Task 1 (first test run)
- **Issue:** `getByRole('button', { name: /next/i })` matched 2 elements: the app's "Next" CTA and a dev-injected button with `aria-label="Open Next.js Dev Tools"`. Playwright strict mode throws on ambiguous locators.
- **Fix:** Changed to `{ name: 'Next', exact: true }` for the Next CTA button.
- **Files modified:** `src/e2e/transfer.spec.ts`
- **Committed in:** 389717a (same task commit)

**2. [Rule 1 - Bug] Receipt text assertion used wrong string**
- **Found during:** Task 1 (second test run)
- **Issue:** `getByText(/receipt/i)` found no elements — the receipt page header renders "Transaction Detail" (from i18n key `title_receipt`), not the word "receipt".
- **Fix:** Changed assertion to `getByText('Transaction Detail')` + verify `Close` button.
- **Files modified:** `src/e2e/transfer.spec.ts`
- **Committed in:** 389717a (same task commit)

**3. [Rule 2 - Missing] Generated files not in .gitignore**
- **Found during:** Post-task git status check
- **Issue:** `test-results/` and `playwright-report/` were untracked generated output directories.
- **Fix:** Added both to `.gitignore`.
- **Files modified:** `.gitignore`
- **Committed in:** 81fc226

## Known Stubs

None — test exercises real rendered UI with real API calls (DEMO_MODE mock responses).

## Issues Encountered

None blocking. All issues resolved inline during test development.

## User Setup Required

None — `npm run test:e2e` runs all E2E tests. DEMO_MODE=true is set in .env.local (required for the test to pass without a live Supabase instance).

## Next Phase Readiness

- Phase 16 complete: all 5 plans executed
- `npm run test:e2e` runs registration + transfer E2E tests
- No blockers

---
*Phase: 16-test-coverage*
*Completed: 2026-04-15*
