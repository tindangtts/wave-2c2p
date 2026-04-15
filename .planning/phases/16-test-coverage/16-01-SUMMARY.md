---
phase: 16-test-coverage
plan: 01
subsystem: testing
tags: [vitest, react-testing-library, jsdom, jest-dom, testing-setup]

# Dependency graph
requires: []
provides:
  - Vitest config with jsdom environment and @vitejs/plugin-react plugin
  - src/test-setup.ts importing @testing-library/jest-dom matchers
  - RTL devDependencies installed (@testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom)
  - "test": "vitest run" script in package.json
  - All 44 existing tests passing under upgraded config
affects: [16-test-coverage plans 02, 03, 04, 05]

# Tech tracking
tech-stack:
  added:
    - "@testing-library/react ^16.3.2"
    - "@testing-library/user-event ^14.6.1"
    - "@testing-library/jest-dom ^6.9.1"
    - "jsdom ^29.0.2"
  patterns:
    - "Vitest with jsdom environment for all tests (safe for both pure-TS and React component tests)"
    - "Exclude .claude worktree directories from test discovery"
    - "Test setup via setupFiles pointing to src/test-setup.ts"

key-files:
  created:
    - src/test-setup.ts
  modified:
    - vitest.config.ts
    - package.json
    - package-lock.json
    - src/lib/auth/__tests__/schemas.test.ts

key-decisions:
  - "jsdom environment used globally (not per-test) — safe for both React and pure-TS test files"
  - "Exclude .claude/** from vitest test discovery to prevent worktree test duplication"
  - "personalInfoSchema test fixtures updated to include required title, gender, email fields"

patterns-established:
  - "Test entry: npm test → vitest run"
  - "RTL available for component tests via @testing-library/react + jsdom"
  - "jest-dom matchers auto-loaded via src/test-setup.ts setupFiles"

requirements-completed: [TEST-01, TEST-02, TEST-03]

# Metrics
duration: 3min
completed: 2026-04-15
---

# Phase 16 Plan 01: Vitest RTL Setup Summary

**Vitest upgraded from node-only to jsdom+React plugin; RTL packages installed; all 44 existing tests pass under the new config**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-15T07:33:18Z
- **Completed:** 2026-04-15T07:36:19Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Installed @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom devDependencies
- Updated vitest.config.ts: jsdom environment, @vitejs/plugin-react plugin, setupFiles, worktree exclusion
- Created src/test-setup.ts importing jest-dom matchers
- Added `"test": "vitest run"` script to package.json
- All 44 existing tests pass under new config (4 test files: currency, auth schemas, passcode, bank-accounts)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install RTL dependencies and update vitest.config.ts** - `2b8a211` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/test-setup.ts` - Imports @testing-library/jest-dom matchers via setupFiles
- `vitest.config.ts` - Upgraded: react plugin, jsdom env, setupFiles, worktree exclusion
- `package.json` - Added "test" script and RTL devDependencies
- `src/lib/auth/__tests__/schemas.test.ts` - Fixed test fixtures to include required title/gender/email fields

## Decisions Made
- `jsdom` environment set globally (not per-test) — safe for both React components and pure TypeScript modules
- Added `exclude: ['**/.claude/**']` to prevent Vitest picking up test files from git worktrees in `.claude/worktrees/`
- Schema test fixtures updated to match current schema shape (title, gender, email added since tests were originally written)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vitest picking up tests from git worktrees**
- **Found during:** Task 1 (running npm test verification)
- **Issue:** Vitest discovered test files inside `.claude/worktrees/agent-*/` directories, causing 4 duplicate test file runs and 8 false failures
- **Fix:** Added `exclude: ['**/node_modules/**', '**/.claude/**', '**/dist/**']` to vitest.config.ts test options
- **Files modified:** vitest.config.ts
- **Verification:** Test file count dropped from 5→4 files; worktree paths no longer appear in output
- **Committed in:** 2b8a211

**2. [Rule 1 - Bug] Fixed pre-existing personalInfoSchema test failures**
- **Found during:** Task 1 (running npm test verification)
- **Issue:** `personalInfoSchema` schema was updated to require `title` (enum), `gender` (enum), and `email` fields, but test fixtures in schemas.test.ts still used the old 4-field shape — causing 2 tests to fail even before this plan
- **Fix:** Updated all `personalInfoSchema.safeParse()` calls in test file to include `title`, `gender`, and `email` fields
- **Files modified:** src/lib/auth/__tests__/schemas.test.ts
- **Verification:** All 44 tests pass; the 2 previously-failing personalInfoSchema tests now pass
- **Committed in:** 2b8a211

---

**Total deviations:** 2 auto-fixed (2x Rule 1 - Bug)
**Impact on plan:** Both fixes necessary for correctness. Pre-existing schema test mismatches and worktree pollution were blocking a clean test run. No scope creep.

## Issues Encountered
- Vitest ran against 5 test file sets (1 main + 4 worktrees) until exclude was added — resolved with Rule 1 auto-fix

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- RTL foundation complete; Plans 02 and 03 can proceed with schema/currency unit tests and component tests
- `npm test` is the single command for all unit tests
- No blockers

---
*Phase: 16-test-coverage*
*Completed: 2026-04-15*
