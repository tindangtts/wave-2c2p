---
phase: 03-ekyc-onboarding
plan: 04
subsystem: ui
tags: [kyc, alert-dialog, camera, resubmit, zustand, next-intl, shadcn]

# Dependency graph
requires:
  - phase: 03-ekyc-onboarding
    provides: KYC store with rejectionReasons, kycStatus, setFrontImage/setBackImage/setSelfieImage; CameraOverlay component; BackHeader; AlertDialog shadcn components
provides:
  - FieldStatusRow component: accepted/rejected field row with CheckCircle/XCircle icons and Badge/Button actions
  - Resubmit page (/(auth)/kyc/resubmit): field-level status display, selective retake per field, CTA disabled until all rejected fields re-captured
  - KYCExpiredModal: AlertDialog with Clock icon, consequences list, Update Now / Update Later CTAs
affects: [home, transfer, wallet-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Heuristic rejection mapping: join rejection reasons, keyword-match to field names (document/blurry → front+back, face/photo → selfie)"
    - "Inline retakeMode state machine: null (list) | 'front' | 'back' | 'selfie' switches between list and CameraOverlay"
    - "Optimistic accepted display: retakenFront/Back/Selfie boolean flips FieldStatusRow from rejected to accepted without re-fetching store"
    - "AlertDialog controlled mode: open={open} prop with no onOpenChange — caller owns open state lifecycle"

key-files:
  created:
    - src/components/features/field-status-row.tsx
    - src/components/features/kyc-expired-modal.tsx
    - src/app/(auth)/kyc/resubmit/page.tsx
  modified:
    - src/app/(auth)/kyc/resubmit/page.tsx (router.push fix)

key-decisions:
  - "Rejection heuristic maps keyword patterns in reason strings to fields: document/blurry/expired/name → front+back rejected; face/photo → selfie rejected; default → front rejected"
  - "retakeMode null|front|back|selfie drives which CameraOverlay variant to show inline — no separate route per field"
  - "FieldStatusRow shows Badge for accepted (green bg, 0 border) and Button[variant=outline size=sm] for rejected Retake action"
  - "KYCExpiredModal uses AlertDialog in controlled mode (open prop only) — parent component owns open/close lifecycle"

patterns-established:
  - "FieldStatusRow: aria-label combines label + status for screen reader field identification"
  - "Resubmit CTA disabled pattern: allRetaken computed from accepted-OR-retaken for each field"
  - "router.push paths never include route group names like (auth)"

requirements-completed: [EKYC-07, EKYC-08]

# Metrics
duration: 15min
completed: 2026-04-14
---

# Phase 03 Plan 04: Re-submission Flow and KYC Expired Modal Summary

**FieldStatusRow component with selective camera retake per rejected field, plus KYCExpiredModal AlertDialog with consequences list — completing the eKYC error recovery cycle**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-14T~10:00:00Z
- **Completed:** 2026-04-14
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- FieldStatusRow component renders accepted fields (dimmed, green check, "Accepted" badge) and rejected fields (red border, XCircle, "Retake" button)
- Re-submission page shows field-level status from rejection reasons, inline CameraOverlay for individual retakes, CTA disabled until all rejected fields re-captured
- KYCExpiredModal AlertDialog with Clock icon, description, consequences list (transfers/deposits/withdrawals), Update Now (yellow) / Update Later (outline) buttons

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FieldStatusRow component and re-submission page** - `ef45198` (feat)
2. **Task 2: Create KYC expired modal component** - `ef45198` (feat)
3. **Auto-fix [Rule 1 - Bug] router.push path fix** - `1d776a9` (fix)

**Plan metadata:** (this commit)

## Files Created/Modified
- `src/components/features/field-status-row.tsx` - Accepted/rejected field row with status icon, label, and action (Badge or Retake button)
- `src/components/features/kyc-expired-modal.tsx` - AlertDialog controlled modal with Clock icon, consequences list, Update Now/Later CTAs
- `src/app/(auth)/kyc/resubmit/page.tsx` - Re-submission page: field status from rejection heuristic, inline retake via CameraOverlay, CTA disabled until all retaken

## Decisions Made
- Rejection reason heuristic: keyword matching on concatenated reasons → field-level accepted/rejected status (no server-side field metadata needed)
- retakeMode state machine drives inline CameraOverlay per field (null = list, 'front'|'back'|'selfie' = camera) — avoids extra routes and iOS PWA camera permission re-prompts
- AlertDialog in controlled mode (open prop only) — parent component owns modal lifecycle

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed router.push paths including route group names**
- **Found during:** Task 1 (Re-submission page implementation)
- **Issue:** Resubmit page used `/(auth)/kyc/processing` and `/(auth)/kyc/status` — route group names in App Router paths cause navigation to fail (per established STATE.md decision)
- **Fix:** Changed to `/kyc/processing` and `/kyc/status`
- **Files modified:** src/app/(auth)/kyc/resubmit/page.tsx
- **Verification:** Build passes, paths match other KYC pages routing pattern
- **Committed in:** `1d776a9`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Critical correctness fix. No scope creep.

## Issues Encountered
None beyond the router.push path deviation which was auto-fixed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full eKYC onboarding flow complete: document-type → capture → processing → status → resubmit (if rejected) → processing
- KYCExpiredModal ready to be integrated into protected pages (home, transfer) when KYC expiry detection is added
- All EKYC requirements (EKYC-01 through EKYC-08) addressed across plans 01-04
- Phase 04 (home dashboard, wallet) can proceed

---
*Phase: 03-ekyc-onboarding*
*Completed: 2026-04-14*
