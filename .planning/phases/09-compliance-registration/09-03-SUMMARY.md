---
phase: 09-compliance-registration
plan: "03"
subsystem: auth-registration
tags: [compliance, kyc, camera, daily-limit, ui]
dependency_graph:
  requires: ["09-01", "09-02"]
  provides: ["daily-limit-page", "camera-overlay-selfie-guide"]
  affects: ["register/daily-limit", "components/features/camera-overlay"]
tech_stack:
  added: []
  patterns: ["shadcn Separator", "box-shadow circular cutout overlay", "Tailwind animate-fade-in"]
key_files:
  created:
    - src/app/(auth)/register/daily-limit/page.tsx
  modified:
    - src/components/features/camera-overlay.tsx
decisions:
  - "Used box-shadow spread hack (0 0 0 9999px rgba) for circular cutout dimming — avoids complex clip-path while achieving the required outer dark overlay effect"
  - "Removed hardcoded 'Take a Selfie' heading from CameraOverlay; instruction/helper text now exclusively driven by props from capture page"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-15T03:05:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
requirements:
  - COMP-03
  - COMP-04
---

# Phase 09 Plan 03: Daily Limit Page and CameraOverlay Selfie Face Guide Summary

Daily limit acknowledgment screen (COMP-03) with two-tier card and CameraOverlay selfie variant updated with 240px circular face guide with dashed white border and outer dim overlay (COMP-04).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create daily transfer limit acknowledgment page | 8816c2b | src/app/(auth)/register/daily-limit/page.tsx |
| 2 | Enhance CameraOverlay with circular face guide for selfie variant | 4b97609 | src/components/features/camera-overlay.tsx |

## What Was Built

### Task 1: Daily Transfer Limit Page

New client component page at `/register/daily-limit`. Renders:
- `BackHeader` with "Transfer Limits" title
- Card (`border border-[#E0E0E0] rounded-xl`) with heading "Daily Transfer Limits"
- KYC Pending row: label at 12px, amount at 20px bold (฿50,000), currency label at 12px
- `Separator` component between tier rows
- KYC Approved row: same layout (฿500,000)
- Disclaimer text below card
- Fixed bottom "I Understand" CTA (yellow pill button) navigating to `/register/personal-info`

### Task 2: CameraOverlay Selfie Face Guide

Replaced the old yellow ring selfie guide with:
- 240x240px container with `animate-fade-in` entrance
- `boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)'` — outer dimming overlay via spread trick
- `border: '2px dashed rgba(255,255,255,0.85)'` — dashed white circular border per UI-SPEC
- `aria-hidden="true"` on the decorative face guide container
- Instruction text below circle (`mt-8`, 32px gap) from `instruction` prop
- Helper text below instruction from `helper` prop
- Document variant (corner markers) completely unchanged

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Verification Results

1. `ls src/app/(auth)/register/daily-limit/page.tsx` — exists
2. `grep "Separator|tier1Amount|personal-info"` — all 3 found
3. `grep "240px|dashed|rgba(0,0,0,0.55)"` — all found
4. `grep "Take a Selfie|border-[#FFE600]"` — NOT found (old selfie removed)
5. `npm run build` — passed, `/register/daily-limit` route in output

## Self-Check: PASSED

- src/app/(auth)/register/daily-limit/page.tsx: FOUND
- src/components/features/camera-overlay.tsx: FOUND (modified)
- Commit 8816c2b: FOUND
- Commit 4b97609: FOUND
