---
phase: 16-test-coverage
plan: 03
subsystem: testing
tags: [vitest, react-testing-library, rtl, jsdom, form-validation, zod, zustand]

# Dependency graph
requires:
  - phase: 16-test-coverage/16-01
    provides: Vitest + RTL setup (jsdom env, setupFiles, @testing-library/react, user-event, jest-dom)
provides:
  - RTL tests for personal-info registration form (5 test cases)
  - RTL tests for new-recipient transfer form (5 test cases)
  - RTL tests for transfer amount entry page (6 test cases)
  - Playwright e2e spec excluded from Vitest discovery (vitest.config.ts)
affects: [16-test-coverage plans 04, 05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All external dependencies (next-intl, next/navigation, zustand stores, SWR hooks) mocked before component import"
    - "Layout components (BackHeader, StepIndicator) mocked with minimal stub returning data-testid"
    - "Complex feature components (MyanmarAddressPicker) mocked with data-testid stub"
    - "global.fetch mocked per test in beforeEach for pages that call API routes"
    - "userEvent.setup() for all keyboard/click interactions"
    - "waitFor() for async validation errors (RHF mode: onSubmit)"
    - "AmountInput tested via aria-label button clicks (keypad interaction)"

key-files:
  created:
    - src/app/(auth)/register/__tests__/personal-info.test.tsx
    - src/app/(main)/transfer/__tests__/new-recipient.test.tsx
    - src/app/(main)/transfer/__tests__/amount.test.tsx
  modified:
    - vitest.config.ts

key-decisions:
  - "Mock layout components with minimal stubs — they have no form logic and cause render overhead"
  - "AmountInput is a custom keypad; tests interact via aria-label button clicks rather than typing into a text input"
  - "Transfer amount validation is inline in page component (not RHF/zod) — tests check validationError conditional render"
  - "Exclude src/e2e/** from vitest test discovery to prevent Playwright specs from breaking unit test runs"

patterns-established:
  - "RTL page test: vi.mock() all hooks/stores before import, beforeEach clears mocks and stubs fetch"
  - "For RHF onSubmit mode: click submit button, then waitFor error text to appear in DOM"
  - "Multiple required_field errors on submit: use getAllByText() not getByText()"

requirements-completed: [TEST-03]

# Metrics
duration: 15min
completed: 2026-04-15
---

# Phase 16 Plan 03: RTL Form Component Tests Summary

**RTL tests for 3 key form pages — personal-info, new-recipient, amount — covering rendering, validation errors, and submit behavior (16 total test cases, all passing)**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-15T14:30:00Z
- **Completed:** 2026-04-15T14:42:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- 5 RTL test cases for personal-info registration form: renders correctly, empty submit errors, dob format validation, email validation, valid submit calls store
- 5 RTL test cases for new-recipient form: renders key fields, empty submit shows alerts, required_field text appears, bank fields conditional on transfer type, Myanmar phone error
- 6 RTL test cases for transfer amount page: keypad renders, recipient summary shown, below-min error, above-max error, valid amount enables Next, no redirect when recipient set
- Fixed Playwright e2e spec polluting Vitest test discovery (pre-existing bug)

## Task Commits

Each task was committed atomically:

1. **Task 1: Personal-info registration form RTL test** - `99b6ccd` (test)
2. **Task 2: New-recipient and transfer amount form RTL tests + e2e vitest exclusion** - `d48d223` (test)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/app/(auth)/register/__tests__/personal-info.test.tsx` - 5 RTL tests for Step 1 registration form
- `src/app/(main)/transfer/__tests__/new-recipient.test.tsx` - 5 RTL tests for new recipient creation form
- `src/app/(main)/transfer/__tests__/amount.test.tsx` - 6 RTL tests for transfer amount entry page
- `vitest.config.ts` - Added `**/e2e/**` to exclude list to prevent Playwright specs from erroring in Vitest

## Decisions Made
- AmountInput is a custom keypad component — tests interact via `getByRole('button', { name: '5' })` clicks instead of typing into a text input (no native input visible)
- Transfer amount validation lives inline in the page component (not via RHF/zod) so tests check conditional `role="alert"` render directly
- Layout components (BackHeader, StepIndicator) mocked with minimal stubs — no benefit to rendering them in form tests
- Mock `global.fetch` in `beforeEach` for pages that call API routes on submit (personal-info posts to `/api/auth/register/step`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Playwright e2e spec breaking Vitest suite**
- **Found during:** Task 2 (running full `npm test` verification)
- **Issue:** `src/e2e/registration.spec.ts` was included in Vitest's test discovery. Vitest loaded the Playwright `test.describe()` call and threw `"Playwright Test did not expect test.describe() to be called here"`, causing 1 test file failure in every suite run
- **Fix:** Added `'**/e2e/**'` to the `exclude` array in `vitest.config.ts`
- **Files modified:** vitest.config.ts
- **Verification:** `npm test` shows 10 passed (0 failed), `src/e2e/registration.spec.ts` no longer appears in vitest output
- **Committed in:** d48d223

**2. [Rule 1 - Bug] Fixed pre-existing new-recipient test failure (from deferred-items.md)**
- **Found during:** Task 2 (first vitest run)
- **Issue:** `screen.getByText('required_field')` threw `TestingLibraryElementError: Found multiple elements with the text: required_field` — documented in deferred-items.md as known from 16-02, assigned to 16-03
- **Fix:** Changed `getByText('required_field')` to `getAllByText('required_field')` and assert `length >= 1`
- **Files modified:** src/app/(main)/transfer/__tests__/new-recipient.test.tsx
- **Verification:** Test passes; all 5 new-recipient tests green
- **Committed in:** d48d223

---

**Total deviations:** 2 auto-fixed (2x Rule 1 - Bug)
**Impact on plan:** Both fixes necessary for a clean passing test suite. No scope creep. The e2e exclusion was a pre-existing oversight from 16-04; the required_field fix was explicitly deferred to this plan in deferred-items.md.

## Issues Encountered
- `getByRole('combobox', { name: /label_transfer_type/ })` required for shadcn Select trigger (renders as `role="combobox"` not `role="button"`) — discovered during test authoring, resolved by reading shadcn Select DOM output

## Known Stubs
None — all three test files exercise real component behavior with proper mocks.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TEST-03 complete: personal-info, new-recipient, and amount forms all have RTL coverage
- Total test suite: 109 passing tests across 10 test files
- 16-04 (E2E) and 16-05 (auth flow) can proceed; Playwright is already excluded from Vitest
- No blockers

---
*Phase: 16-test-coverage*
*Completed: 2026-04-15*
