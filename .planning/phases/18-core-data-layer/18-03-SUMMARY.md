---
phase: 18-core-data-layer
plan: "03"
subsystem: api
tags: [drizzle, neon, cards, visa, supabase, demo-mode]

# Dependency graph
requires:
  - phase: 18-01
    provides: Drizzle schema (cards table definition) and db singleton in src/db/

provides:
  - GET /api/cards endpoint returning card data from Drizzle cards table
  - Card page fetching from /api/cards instead of hardcoded MOCK_CARD_NUMBER constants
  - Lazy neon() initialization in db/index.ts (prevents build crash when DATABASE_URL absent)

affects: [22-demo-mode-removal, card-freeze-feature]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lazy Proxy pattern for Drizzle db singleton: neon() deferred to first request, not module load"
    - "Auth-then-Drizzle API route: supabase.auth.getUser() gates Drizzle query"
    - "Demo mode branch before auth: isDemoMode returns mock data without hitting DB or auth"

key-files:
  created:
    - src/app/api/cards/route.ts
  modified:
    - src/app/(main)/profile/card/page.tsx
    - src/db/index.ts

key-decisions:
  - "db/index.ts uses Proxy-based lazy singleton: neon() called only on first db.select/insert usage, not at module load — prevents Next.js build crash when DATABASE_URL is absent in CI/demo environments"
  - "cards API never exposes card_number_encrypted or cvv_encrypted — only card_number_masked and display fields returned to client"
  - "Card reveal feature shows masked number in both states (real mode); full card number not stored client-side is correct security posture"

patterns-established:
  - "Lazy Drizzle db pattern: all future Drizzle-backed API routes can import db from @/db and it will defer neon() initialization safely"

requirements-completed: [DATA-06]

# Metrics
duration: 3min
completed: "2026-04-15"
---

# Phase 18 Plan 03: Cards API Summary

**GET /api/cards endpoint serving Visa card data from Drizzle cards table, replacing MOCK_CARD_NUMBER hardcoded constants in card page with live API fetch**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-15T09:44:59Z
- **Completed:** 2026-04-15T09:48:08Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Created `src/app/api/cards/route.ts`: GET endpoint with demo mode branch, auth gate, Drizzle select filtered by user_id — no encrypted fields exposed
- Updated card page to fetch `/api/cards` on mount, initialize frozen state from `card.is_frozen`, show loading skeleton while fetching
- Fixed `src/db/index.ts` with lazy Proxy initialization to prevent Next.js build crash when `DATABASE_URL` is absent

## Task Commits

1. **Task 1: Create /api/cards route and update card page** - `5e6124e` (feat)

**Plan metadata:** _(pending)_

## Files Created/Modified
- `src/app/api/cards/route.ts` - New GET endpoint: demo mode mock → auth check → Drizzle select from cards table scoped to user
- `src/app/(main)/profile/card/page.tsx` - Removed MOCK_CARD_NUMBER/MOCK_EXPIRY/MOCK_HOLDER_NAME; fetches /api/cards; loading skeleton; frozen state from API
- `src/db/index.ts` - Lazy Proxy singleton: neon() deferred to first use, prevents build-time crash when DATABASE_URL absent

## Decisions Made
- Lazy Proxy for db export so `db.select()` still works at callsite without any API change
- Encrypted fields (`card_number_encrypted`, `cvv_encrypted`) deliberately omitted from API response — security requirement
- Reveal toggle shows masked number in both revealed/hidden states for real DB data (full number not stored client-side)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Lazy-initialize neon() in db/index.ts to fix build crash**
- **Found during:** Task 1 (build verification after creating /api/cards)
- **Issue:** `neon(process.env.DATABASE_URL!)` called at module load time. Next.js build's page data collection imports the module, crashing with "No database connection string was provided" when `DATABASE_URL` is absent (demo/.env.local doesn't set it)
- **Fix:** Replaced eager initialization with a Proxy-based lazy singleton — `getDb()` called on first property access, `_db` cached for subsequent calls
- **Files modified:** `src/db/index.ts`
- **Verification:** `npm run build` passes; all API routes including /api/cards appear in build output without error
- **Committed in:** `5e6124e` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for build correctness. No scope creep — fix stays within db/index.ts, no API changes required at callsites.

## Issues Encountered
- Plans 18-01 and 18-02 used Supabase client directly (not Drizzle) so the build-time neon() crash was not previously observed. This plan is the first to introduce a Drizzle-backed API route, surfacing the issue.

## Known Stubs
None — card page fetches from /api/cards and renders live data. Demo mode returns consistent mock values matching the previous hardcoded constants.

## User Setup Required
None - no external service configuration required. Demo mode uses mock card data without DATABASE_URL.

## Next Phase Readiness
- Drizzle lazy singleton pattern is now established and safe for all future Drizzle-backed API routes
- /api/cards endpoint ready for Phase 22 demo mode removal (DATA-06 satisfied)
- Card freeze toggle still fires mock API internally — requires write-back route in Phase 19

---
*Phase: 18-core-data-layer*
*Completed: 2026-04-15*
