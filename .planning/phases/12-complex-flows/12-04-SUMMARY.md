---
phase: 12-complex-flows
plan: "04"
subsystem: kyc
tags: [kyc, work-permit, profile, camera, single-route]
dependency_graph:
  requires: [12-02]
  provides: [work-permit-update-page, profile-kyc-entry]
  affects: [profile-page, kyc-flows]
tech_stack:
  added: []
  patterns: [single-route-camera-flow, step-machine, local-state-only]
key_files:
  created:
    - src/app/(auth)/kyc/work-permit-update/page.tsx
  modified:
    - src/app/(main)/profile/page.tsx
decisions:
  - Work permit update page uses local state (not KYCStore) to isolate re-verification flow from onboarding state
  - Single-route step machine avoids iOS PWA camera permission re-prompts
  - tKyc alias used in profile page to avoid collision with existing t (profile namespace)
metrics:
  duration_seconds: 110
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_changed: 2
---

# Phase 12 Plan 04: Work Permit Update Page Summary

**One-liner:** Standalone work permit re-verification page with front+back camera capture on a single route, wired to profile menu for expired/pending_update KYC users.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build standalone work permit update capture page | af90b73 | src/app/(auth)/kyc/work-permit-update/page.tsx |
| 2 | Add "Update Work Permit" entry to profile menu | b201ad3 | src/app/(main)/profile/page.tsx |

## What Was Built

### Work Permit Update Page (`/kyc/work-permit-update`)

A self-contained single-route flow using a local step machine:

- `capture-front` — CameraOverlay (document variant) for front of work permit; back button triggers cancel dialog
- `review-front` — Preview with Retake / Use Photo buttons
- `capture-back` — CameraOverlay for back of work permit
- `review-back` — Preview with Retake / Use Photo buttons
- `confirm` — Shows both thumbnails (front + back) with Submit button
- `submitted` — Success (CheckCircle2 + "transfers remain accessible" message) or Fail (XCircle + retry)

POSTs to `/api/mock-kyc/work-permit-update`. Cancel dialog on first capture step warns that photos will be lost.

### Profile Page Update

- Extended Supabase select to include `kyc_status`
- Derived `needsWorkPermitUpdate` boolean (true when `expired` or `pending_update`)
- Conditionally renders "Update Work Permit" menu item in the Settings section
- Used `tKyc = useTranslations("kyc")` to avoid collision with existing `t = useTranslations("profile")`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data is wired. The page posts real requests to the mock API and renders actual API response results.

## Self-Check: PASSED

Files created:
- FOUND: src/app/(auth)/kyc/work-permit-update/page.tsx

Commits verified:
- af90b73 — feat(12-04): add work permit update capture page
- b201ad3 — feat(12-04): add Update Work Permit entry to profile menu

Build: Compiled successfully with no TypeScript errors.
