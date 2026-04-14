---
phase: 03-ekyc-onboarding
plan: 02
subsystem: ui
tags: [kyc, camera, file-input, ios-pwa, accessibility, zustand, next-intl]

# Dependency graph
requires:
  - phase: 03-01
    provides: KYC Zustand store with captureStep state machine, documentTypeSchema, i18n keys in kyc.json, StepIndicator with dark variant

provides:
  - DocumentTypeCard component (role=radio, aria-checked, yellow selection state)
  - Document type selection page at /kyc/document-type with 5 document types
  - CameraOverlay component with document (85.6:54 aspect ratio, yellow corner markers) and selfie (yellow circle) variants
  - Multi-step capture page at /kyc/capture driving full front→back→selfie state machine
  - iOS PWA camera fallback via native file input with capture attribute

affects: [03-03, 03-04, future-kyc-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Camera capture via native <input type=file capture=environment> for cross-platform PWA support"
    - "FileReader.readAsDataURL for base64 image conversion before Zustand store save"
    - "Single-route state machine (captureStep) to avoid iOS PWA camera permission re-prompts"
    - "Separate gallery input without capture attribute for iOS PWA fallback"

key-files:
  created:
    - src/components/features/document-type-card.tsx
    - src/app/(auth)/kyc/document-type/page.tsx
    - src/components/features/camera-overlay.tsx
    - src/app/(auth)/kyc/capture/page.tsx
  modified:
    - src/app/(auth)/kyc/processing/page.tsx
    - src/app/(auth)/kyc/status/page.tsx

key-decisions:
  - "Camera capture implemented via native <input capture> attribute — works on Android Chrome and iOS Safari without native WebRTC complexity"
  - "Single /kyc/capture route handles all 6 capture states (front/back/selfie + reviews) — avoids iOS permission re-prompts across route changes"
  - "Separate gallery file input (no capture attribute) as fallback — users always have gallery option regardless of camera support"
  - "Base64 image data stored in Zustand persisted store — survives page refresh, no temporary state lost"

patterns-established:
  - "CameraOverlay: full-screen dark overlay (bg-[#1A1A2E]/90) with guide frame, shutter button (w-16 h-16 bg-white ring-4 ring-[#FFE600]), and flash effect"
  - "DocumentTypeCard: role=radio on card div, aria-checked for selection state, yellow border + bg-[#FFFDE7] when selected"
  - "Review screens: always show BackHeader, image preview with max-w-[300px], Retake (outline) + Use Photo (yellow) action row"

requirements-completed: [EKYC-01, EKYC-02, EKYC-03, EKYC-04]

# Metrics
duration: 8min
completed: 2026-04-14
---

# Phase 03 Plan 02: eKYC Document Capture UI Summary

**DocumentTypeCard radio selector + full-screen CameraOverlay with document guide frame and selfie circle driving a 6-step single-route capture state machine**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-14T09:45:00Z
- **Completed:** 2026-04-14T09:53:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- DocumentTypeCard component with proper WCAG radio semantics (role=radio, aria-checked, radiogroup container)
- Document type selection page listing national_id, work_permit, pink_card, owic, visa with yellow selection state
- CameraOverlay component: document variant with 85.6:54 aspect ratio frame and yellow L-corner markers; selfie variant with yellow circle guide and pulse ring
- Capture page state machine routing through all 6 steps: capture-front → review-front → capture-back → review-back → capture-selfie → review-selfie → processing
- iOS PWA camera fallback handled natively by browser when `capture` attribute is unsupported

## Task Commits

Each task was committed atomically:

1. **Task 1: DocumentTypeCard + document type selection page** - `eb2afa4` (feat)
2. **Task 2: CameraOverlay + multi-step capture page** - `6acc7d8` (feat)
3. **Bug fix: router.push paths in processing/status pages** - (already committed in prior session)

## Files Created/Modified
- `src/components/features/document-type-card.tsx` - Selectable radio card with yellow selection state and accessibility attributes
- `src/app/(auth)/kyc/document-type/page.tsx` - 5-option document type selection screen with radiogroup and Continue CTA
- `src/components/features/camera-overlay.tsx` - Full-screen camera overlay with document/selfie variants, shutter button, gallery fallback
- `src/app/(auth)/kyc/capture/page.tsx` - Multi-step capture state machine (6 states) with review screens
- `src/app/(auth)/kyc/processing/page.tsx` - Fixed router.push paths (removed (auth) group prefix)
- `src/app/(auth)/kyc/status/page.tsx` - Fixed router.push paths and expired state CTA

## Decisions Made
- Single-route design for /kyc/capture avoids iOS PWA camera re-prompts (per CONTEXT.md D-01)
- CameraOverlay uses `<input type="file" capture="environment|user">` — cross-platform without native WebRTC
- Separate gallery input (no capture attribute) always visible — graceful iOS PWA degradation
- Base64 images stored in Zustand (persisted to localStorage) — survives page refreshes during multi-step flow

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect router.push paths using (auth) route group prefix**
- **Found during:** Task 1 and Task 2 review
- **Issue:** `router.push('/(auth)/kyc/capture')` uses the route group name in the URL which Next.js App Router does not include in actual URL paths
- **Fix:** Removed `(auth)` prefix — all paths now use `/kyc/capture`, `/kyc/document-type`, `/kyc/processing`, `/kyc/status`
- **Files modified:** src/app/(auth)/kyc/document-type/page.tsx, src/app/(auth)/kyc/capture/page.tsx, src/app/(auth)/kyc/processing/page.tsx, src/app/(auth)/kyc/status/page.tsx
- **Verification:** npm run build passes, all 4 routes visible in build output as `/kyc/*`
- **Committed in:** eb2afa4, 6acc7d8 (task commits)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug: incorrect Next.js route group paths)
**Impact on plan:** Essential fix — navigation between KYC screens would silently fail without this. No scope creep.

## Issues Encountered
- Files were already present from a previous partial execution. Verified all acceptance criteria against existing code, fixed the router.push path bug, and confirmed build passes. No work needed to be redone.

## Known Stubs
None — camera overlay renders guide overlays correctly, image capture flows to Zustand store, review screens show real captured images.

## Next Phase Readiness
- Document capture flow is complete and ready for Plan 03-03 (processing animation + status page)
- All 6 capture steps flow correctly through Zustand store
- Base64 images ready for submission to mock-kyc API

---
*Phase: 03-ekyc-onboarding*
*Completed: 2026-04-14*
