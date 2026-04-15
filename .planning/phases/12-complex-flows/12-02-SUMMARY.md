---
phase: 12-complex-flows
plan: "02"
subsystem: kyc
tags: [api, mock, kyc, work-permit, i18n]
dependency_graph:
  requires: []
  provides:
    - POST /api/mock-kyc/work-permit-update
    - kyc.workPermitUpdate i18n keys (en/th/mm)
  affects:
    - 12-04 (UI plan consuming this API)
    - src/lib/kyc/schemas.ts (KYCStatusValue extended)
tech_stack:
  added: []
  patterns:
    - mock-api-env-flag (MOCK_KYC_AUTO_APPROVE pattern)
    - pending_update kyc status (preserves transfer access during re-verification)
key_files:
  created:
    - src/app/api/mock-kyc/work-permit-update/route.ts
  modified:
    - src/lib/kyc/schemas.ts
    - messages/en/kyc.json
    - messages/th/kyc.json
    - messages/mm/kyc.json
decisions:
  - pending_update status is distinct from pending — user retains transfer access during re-verification
  - Rejection path does NOT update user_profiles.kyc_status to preserve current access
  - kycStatusSchema extended in schemas.ts to include pending_update for TypeScript consistency
metrics:
  duration: "~3 minutes"
  completed: "2026-04-15T04:44:18Z"
  tasks_completed: 2
  files_changed: 5
requirements_satisfied:
  - COMP-05
---

# Phase 12 Plan 02: Work Permit Update API + i18n Summary

**One-liner:** Mock work permit update KYC endpoint with `pending_update` status and full en/th/mm i18n strings for the standalone document update flow.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create POST /api/mock-kyc/work-permit-update route | a26d435 | src/app/api/mock-kyc/work-permit-update/route.ts, src/lib/kyc/schemas.ts |
| 2 | Add work permit update i18n strings to all 3 locales | 404de1f | messages/en/kyc.json, messages/th/kyc.json, messages/mm/kyc.json |

## What Was Built

### API Route: POST /api/mock-kyc/work-permit-update

Follows the same auth + admin + env pattern as `src/app/api/mock-kyc/submit/route.ts`:

- **Auth guard:** Returns 401 if no authenticated user
- **Env flags:** `MOCK_KYC_AUTO_APPROVE` (default: true), `MOCK_KYC_DELAY_MS` (default: 1500)
- **Success path (autoApprove=true):**
  - Inserts `kyc_documents` row with `status: 'pending'` (awaiting async approval in real system)
  - Updates `user_profiles.kyc_status = 'pending_update'` — preserves transfer access
  - Returns `{ success: true, status: 'pending_update', verification_id: 'WP-UPDATE-{ts}' }`
- **Rejection path (autoApprove=false):**
  - Inserts `kyc_documents` row with `status: 'rejected'` and random rejection reason
  - Does NOT modify `user_profiles.kyc_status` — user retains current access level
  - Returns `{ success: false, status: 'rejected', verification_id, rejection_reasons: [reason] }`
- **Error handling:** try/catch returns 500 with `{ error: 'Verification could not be completed' }`

### Schema Extension

`src/lib/kyc/schemas.ts` extended `kycStatusSchema` zod enum to include `'pending_update'`, keeping TypeScript types consistent across the codebase.

### i18n Strings

All 3 locale kyc.json files (en/th/mm) received a new `workPermitUpdate` top-level key with:
- `title`, `subtitle`, `frontInstruction`, `backInstruction`
- `submitCta`, `submittingLabel`
- `successTitle`, `successBody`, `successCta`
- `failTitle`, `failBody`, `failCta`
- `cancelDialog.title`, `cancelDialog.description`, `cancelDialog.cancel`, `cancelDialog.confirm`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan produces an API route and i18n strings only. No UI stubs.

## Self-Check: PASSED

- [x] `src/app/api/mock-kyc/work-permit-update/route.ts` exists
- [x] `grep -q "pending_update" src/app/api/mock-kyc/work-permit-update/route.ts` passes
- [x] `grep -r "workPermitUpdate" messages/` hits en, th, mm kyc.json
- [x] `npm run build` passes with no TypeScript errors
- [x] Commits a26d435 and 404de1f exist
