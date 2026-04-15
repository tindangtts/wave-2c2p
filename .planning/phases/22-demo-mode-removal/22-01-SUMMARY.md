---
phase: 22-demo-mode-removal
plan: "01"
subsystem: api
tags: [drizzle, supabase, demo-mode, cleanup, route-handlers]

# Dependency graph
requires:
  - phase: 18-core-data-layer
    provides: Drizzle ORM schema and db client used by all 10 routes
  - phase: 19-payment-write-back
    provides: Drizzle write paths for process-transfer, p2p-transfer, topup, withdraw
  - phase: 20-new-tables-seed
    provides: Drizzle write paths for notifications and voucher routes
provides:
  - All 10 Group A API routes execute Drizzle paths unconditionally — no isDemoMode guard
affects: [22-demo-mode-removal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "isDemoMode conditional branches removed from all data-layer routes — routes now run Drizzle path unconditionally"

key-files:
  created: []
  modified:
    - src/app/api/wallet/route.ts
    - src/app/api/transactions/route.ts
    - src/app/api/wallet/transactions/route.ts
    - src/app/api/cards/route.ts
    - src/app/api/notifications/route.ts
    - src/app/api/voucher/route.ts
    - src/app/api/mock-payment/process-transfer/route.ts
    - src/app/api/mock-payment/p2p-transfer/route.ts
    - src/app/api/mock-payment/topup/route.ts
    - src/app/api/mock-payment/withdraw/route.ts

key-decisions:
  - "Worktree synced from main before execution — worktree branch was at 68325f0 (pre-Phase 18), merged forward to include all Drizzle migration work"
  - "DEMO_NOTIFICATIONS array (notifications/route.ts) and VALID_VOUCHERS map (voucher/route.ts) removed entirely — both were only referenced inside isDemoMode blocks"
  - "isDemoMode import removed alongside demo blocks in all files — no remaining references to @/lib/demo in any of the 10 routes"

patterns-established:
  - "Demo removal pattern: delete import line, delete isDemoMode block, keep all code after block unchanged"

requirements-completed: [DATA-08]

# Metrics
duration: 3min
completed: 2026-04-15
---

# Phase 22 Plan 01: Demo Mode Removal — Group A Routes Summary

**Stripped isDemoMode imports and early-return demo blocks from all 10 data-layer API routes, leaving each route executing its Drizzle path unconditionally**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-15T12:24:48Z
- **Completed:** 2026-04-15T12:27:42Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Removed isDemoMode guards from 6 core data routes (wallet, transactions, wallet/transactions, cards, notifications, voucher)
- Removed isDemoMode guards from 4 payment routes (process-transfer, p2p-transfer, topup, withdraw)
- Deleted DEMO_NOTIFICATIONS array and VALID_VOUCHERS in-memory map (demo-only data structures)
- All 10 routes now invoke Supabase auth + Drizzle ORM on every request with no conditional branching

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove isDemoMode from wallet, transactions, cards, notifications, voucher** - `8dd3b79` (feat)
2. **Task 2: Remove isDemoMode from process-transfer, p2p-transfer, topup, withdraw** - `2ea94e6` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/api/wallet/route.ts` - Removed isDemoMode import + demo block (lines 3, 7-23)
- `src/app/api/transactions/route.ts` - Removed isDemoMode import + demo branch
- `src/app/api/wallet/transactions/route.ts` - Removed isDemoMode import + demo block
- `src/app/api/cards/route.ts` - Removed isDemoMode import + demo block with mock card data
- `src/app/api/notifications/route.ts` - Removed isDemoMode import, DEMO_NOTIFICATIONS array, demo blocks in GET and PATCH
- `src/app/api/voucher/route.ts` - Removed isDemoMode import, VALID_VOUCHERS map, demo block
- `src/app/api/mock-payment/process-transfer/route.ts` - Removed isDemoMode import + demo early-return block
- `src/app/api/mock-payment/p2p-transfer/route.ts` - Removed isDemoMode/DEMO_USER/DEMO_WALLET imports + demo block
- `src/app/api/mock-payment/topup/route.ts` - Removed isDemoMode/DEMO_USER/DEMO_WALLET imports + demo block
- `src/app/api/mock-payment/withdraw/route.ts` - Removed isDemoMode import + demo block

## Decisions Made
- Synced worktree from main before editing — the worktree branch (worktree-agent-a8a8ea5e) was at an old commit predating all Phase 18-21 Drizzle migration work; a fast-forward merge of main was required to get the correct file versions
- No new code written — pure deletion of dead branches and their associated data structures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Synced worktree branch with main before execution**
- **Found during:** Task 1 setup (reading files)
- **Issue:** Worktree was at commit 68325f0 — cards, notifications, voucher routes did not exist; mock-payment routes lacked Drizzle paths. The plan's target files only existed on main (post Phase 18-21).
- **Fix:** Ran `git merge main` (fast-forward) to bring all Phase 18-21 changes into the worktree branch
- **Files modified:** All 10 target files (pulled from main)
- **Verification:** `ls src/app/api/` confirmed all 10 directories present after merge
- **Committed in:** Merge commit (fast-forward, no separate commit created)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing files resolved by git merge)
**Impact on plan:** Merge was prerequisite for execution. No scope creep. All edits performed exactly as specified.

## Issues Encountered
- Worktree branch predated all Phases 18-21 — cards/notifications/voucher routes missing, payment routes lacked Drizzle paths. Fast-forward merge from main resolved this cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 10 Group A routes now execute Drizzle paths unconditionally
- Ready for Phase 22 Plan 02+ (remaining isDemoMode files across other parts of the codebase)
- No blockers

---
*Phase: 22-demo-mode-removal*
*Completed: 2026-04-15*

## Self-Check: PASSED

- All 10 target files: FOUND
- Commit 8dd3b79: FOUND
- Commit 2ea94e6: FOUND
- isDemoMode grep across all 10 files: 0 matches
