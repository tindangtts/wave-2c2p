---
phase: 01-foundation
plan: 01
subsystem: design-system
tags: [design-tokens, fonts, accessibility, navigation, badge]
dependency_graph:
  requires: []
  provides: [design-tokens, font-loading, accessible-nav, status-badges]
  affects: [all-downstream-phases]
tech_stack:
  added: [Noto_Sans_Thai, Noto_Sans_Myanmar]
  patterns: [css-custom-properties, next-font-google, aria-attributes]
key_files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/components/layout/bottom-nav.tsx
    - src/components/ui/badge.tsx
decisions:
  - "Used Noto Sans Myanmar instead of Noto Sans Myanmar UI — UI variant not available in next/font/google font-data.json"
  - "Absolute pixel radius values (4px/8px/12px/16px/24px/32px/40px) replace calc()-based relative values for predictable rendering"
metrics:
  duration: ~15 minutes
  completed: "2026-04-14"
  tasks_completed: 3
  files_modified: 4
requirements: [FOUN-01, FOUN-02, FOUN-03]
---

# Phase 01 Plan 01: Design System Foundation Summary

**One-liner:** CSS design token system with Noto Sans Thai/Myanmar fonts, absolute radius values, status bar token, lang selectors, accessible 44px bottom nav, and Badge status variants.

## What Was Built

### Task 1: Design tokens and font references in globals.css (commit: 2c9f870)

- Added 4 typography scale tokens: `--text-display: 1.75rem`, `--text-heading: 1.25rem`, `--text-body: 1rem`, `--text-caption: 0.75rem`
- Replaced Geist+Padauk font family references with CSS variables `var(--font-thai)` and `var(--font-myanmar)`
- Replaced all `calc(var(--radius) * X)` relative radius values with absolute pixel values per UI-SPEC
- Added `--radius-none: 0px` and `--radius-full: 9999px`
- Added `--status-bar-height: 44px` to layout tokens
- Added `:lang(th)` and `:lang(my)` font selectors in `@layer base`
- Preserved: `env(safe-area-inset-bottom/top)`, `--primary: #FFE600`, max-w-[430px] container

### Task 2: Replace Geist with Noto Sans Thai + Noto Sans Myanmar in root layout (commit: 40e1298)

- Replaced `Geist` import with `Noto_Sans_Thai` and `Noto_Sans_Myanmar` from `next/font/google`
- Both fonts load weights 400 and 700 with `display: swap`
- CSS variables `--font-thai` and `--font-myanmar` applied to `<html>` element
- Added `format-detection` meta tag to prevent iOS auto-linking of phone/date/address/email
- Preserved `max-w-[430px]` mobile container (FOUN-01)
- Build passes without errors

### Task 3: Bottom nav accessibility + Badge status variants (commit: c823503)

- Added `role="navigation"` and `aria-label="Main"` to `<nav>` element
- Added `aria-current="page"` to active tab links
- Added `aria-label="Add Money"` to center FAB link
- Changed label text from `text-[10px]` to `text-xs` (12px) matching `--text-caption`
- Added `min-h-[44px]` to all nav link tap areas (D-11: 44px touch target minimum)
- Added Badge variants: `success` (bg-#E8F5E9), `warning` (bg-#FFF3E0), `info` (bg-#E1F5FE), all with dark `#212121` text

## Decisions Made

1. **Noto Sans Myanmar instead of Noto Sans Myanmar UI**: `Noto_Sans_Myanmar_UI` does not exist in `next/font/google`'s `font-data.json`. Using `Noto_Sans_Myanmar` which is available and covers Myanmar script. This differs from the plan spec but is the correct available font.

2. **Absolute pixel radius values**: Plan specified replacing `calc()`-based values with absolute pixels — `4px/8px/12px/16px/24px/32px/40px`. This ensures predictable rendering regardless of the `--radius` base variable.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Noto Sans Myanmar UI unavailable in next/font/google**
- **Found during:** Task 2 — build failed with "Unknown font" error
- **Issue:** `Noto_Sans_Myanmar_UI` is not in Next.js's Google Fonts registry (`font-data.json`). Only `Noto Sans Myanmar` is available.
- **Fix:** Changed import and usage from `Noto_Sans_Myanmar_UI` to `Noto_Sans_Myanmar`. The `--font-myanmar` CSS variable name and all downstream references remain unchanged.
- **Files modified:** `src/app/layout.tsx`
- **Commit:** 40e1298

## Success Criteria Verification

- [x] globals.css has complete token system: typography (display/heading/body/caption), absolute radius (4px/8px/12px/16px/24px), status-bar-height, lang selectors
- [x] Root layout loads Noto Sans Thai + Noto Sans Myanmar via next/font/google (not Geist, not Padauk)
- [x] Bottom nav passes accessibility: role, aria-label, aria-current, 44px min touch targets (D-11)
- [x] Badge component has success/warning/info variants for status indicators
- [x] Safe area insets and max-w-[430px] container preserved (FOUN-01)
- [x] --primary: #FFE600 brand palette preserved (FOUN-03)
- [x] `npm run build` passes

## Known Stubs

None — all tokens, fonts, and components are fully wired. No placeholder data or hardcoded empty values.

## Self-Check: PASSED

- FOUND: src/app/globals.css
- FOUND: src/app/layout.tsx
- FOUND: src/components/layout/bottom-nav.tsx
- FOUND: src/components/ui/badge.tsx
- FOUND: commit 2c9f870 (globals.css tokens)
- FOUND: commit 40e1298 (layout.tsx fonts)
- FOUND: commit c823503 (bottom-nav + badge)
