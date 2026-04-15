---
phase: 22-demo-mode-removal
plan: "03"
subsystem: api-routes
tags: [demo-mode-removal, api, supabase, cleanup]
dependency_graph:
  requires: []
  provides: [bank-accounts-real-path, spending-limits-real-path, statement-real-path, referral-stats-real-path, mock-kyc-submit-real-path, refresh-secret-code-real-path, recipients-real-path, recipients-id-real-path]
  affects: [src/app/api/bank-accounts, src/app/api/spending-limits, src/app/api/statement, src/app/api/referral/stats, src/app/api/mock-kyc/submit, src/app/api/mock-payment/refresh-secret-code, src/app/api/recipients, src/app/api/recipients/[id]]
tech_stack:
  added: []
  patterns: [demo-mode-removal, supabase-real-path]
key_files:
  created: []
  modified:
    - src/app/api/bank-accounts/route.ts
    - src/app/api/spending-limits/route.ts
    - src/app/api/statement/route.ts
    - src/app/api/referral/stats/route.ts
    - src/app/api/mock-kyc/submit/route.ts
    - src/app/api/mock-payment/refresh-secret-code/route.ts
    - src/app/api/recipients/route.ts
    - src/app/api/recipients/[id]/route.ts
decisions:
  - Removed DEMO_BANK_ACCOUNTS local constant from bank-accounts/route.ts (used only in demo block)
  - Removed DEMO_SPENDING_LIMITS local constant from spending-limits/route.ts (used only in demo block)
  - Kept SPENDING_TIERS constant — used by real PATCH path for tier value lookup
  - recipients/[id]/route.ts had isDemoMode in three handlers (PUT, DELETE, PATCH) — all three removed
metrics:
  duration: ~5min
  completed: 2026-04-15
  tasks_completed: 2
  files_modified: 8
---

# Phase 22 Plan 03: Remove isDemoMode from Group C API Routes Summary

**One-liner:** Stripped isDemoMode imports and conditional branches from 8 Group C API routes — bank-accounts, spending-limits, statement, referral/stats, mock-kyc/submit, refresh-secret-code, recipients, and recipients/[id] — leaving only the real Supabase execution path.

## Tasks Completed

| Task | Name | Commit | Files Modified |
|------|------|--------|----------------|
| 1 | Remove isDemoMode from bank-accounts, spending-limits, statement, referral/stats | 32cd8cb | 4 files, 78 deletions |
| 2 | Remove isDemoMode from mock-kyc/submit, refresh-secret-code, recipients, recipients/[id] | 7ba9b98 | 4 files, 56 deletions |

## What Changed

**Task 1 (4 files, 78 deletions):**
- `bank-accounts/route.ts`: Removed `isDemoMode, DEMO_USER` import, `DEMO_BANK_ACCOUNTS` array constant, and 3 isDemoMode blocks (GET, POST, DELETE)
- `spending-limits/route.ts`: Removed `isDemoMode` import, `DEMO_SPENDING_LIMITS` constant, and 2 isDemoMode blocks (GET, PATCH)
- `statement/route.ts`: Removed `isDemoMode, DEMO_TRANSACTIONS` import and isDemoMode block in GET
- `referral/stats/route.ts`: Removed `isDemoMode` import and isDemoMode block in GET

**Task 2 (4 files, 56 deletions):**
- `mock-kyc/submit/route.ts`: Removed `isDemoMode` import and isDemoMode early-return block in POST
- `refresh-secret-code/route.ts`: Removed `isDemoMode` import and isDemoMode block (transaction_id check + secret_code generation) in POST
- `recipients/route.ts`: Removed `isDemoMode, DEMO_RECIPIENTS` import and isDemoMode block in GET (POST handler had no demo block — left unchanged)
- `recipients/[id]/route.ts`: Removed `isDemoMode, DEMO_RECIPIENTS` import and isDemoMode blocks in PUT, DELETE, and PATCH handlers

## Verification

Final grep across all 8 route directories returned zero matches:
```
grep -rn "isDemoMode|from '.*lib/demo'|from \".*lib/demo\"" \
  src/app/api/bank-accounts/ src/app/api/spending-limits/ \
  src/app/api/statement/ src/app/api/referral/ src/app/api/mock-kyc/ \
  src/app/api/mock-payment/refresh-secret-code/ src/app/api/recipients/
→ (no output — 0 matches)
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all routes execute real Supabase/auth paths exclusively.

## Self-Check: PASSED

Files modified:
- [x] src/app/api/bank-accounts/route.ts — FOUND
- [x] src/app/api/spending-limits/route.ts — FOUND
- [x] src/app/api/statement/route.ts — FOUND
- [x] src/app/api/referral/stats/route.ts — FOUND
- [x] src/app/api/mock-kyc/submit/route.ts — FOUND
- [x] src/app/api/mock-payment/refresh-secret-code/route.ts — FOUND
- [x] src/app/api/recipients/route.ts — FOUND
- [x] src/app/api/recipients/[id]/route.ts — FOUND

Commits:
- [x] 32cd8cb — FOUND
- [x] 7ba9b98 — FOUND
