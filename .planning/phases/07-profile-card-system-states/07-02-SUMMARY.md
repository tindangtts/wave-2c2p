---
phase: 07-profile-card-system-states
plan: "02"
subsystem: system-states
tags: [system-modals, error-boundary, loading-skeletons, maintenance, update-required]
dependency_graph:
  requires: []
  provides:
    - MaintenanceModal (D-13)
    - UpdateRequiredModal (D-14)
    - AppErrorBoundary (D-15)
    - ProfileMenuSkeleton + CardPageSkeleton (D-16)
    - /api/system-status route
  affects:
    - src/app/layout.tsx (SystemStateChecker mounted)
tech_stack:
  added: []
  patterns:
    - Base UI AlertDialog controlled mode for non-dismissible system modals
    - initialFocus={false} on Base UI AlertDialogContent to suppress auto-focus (not onOpenAutoFocus)
    - Class-based React error boundary for inline usage (AppErrorBoundary)
    - Next.js error.tsx + global-error.tsx convention for route-segment error handling
    - animate-pulse Tailwind for skeleton shimmer
key_files:
  created:
    - src/app/api/system-status/route.ts
    - src/components/features/maintenance-modal.tsx
    - src/components/features/update-required-modal.tsx
    - src/components/features/system-state-checker.tsx
    - src/components/layout/app-error-boundary.tsx
    - src/components/features/page-skeleton.tsx
    - src/app/error.tsx
    - src/app/global-error.tsx
    - src/app/(main)/profile/loading.tsx
    - src/app/(main)/profile/card/loading.tsx
  modified:
    - src/app/layout.tsx
decisions:
  - Base UI AlertDialog uses initialFocus prop (not onOpenAutoFocus) to suppress auto-focus on modal open
metrics:
  duration_seconds: 189
  completed_date: "2026-04-14"
  tasks_completed: 2
  tasks_total: 2
  files_created: 10
  files_modified: 1
requirements_satisfied:
  - SYST-01
  - SYST-02
  - SYST-03
  - SYST-04
  - SYST-05
---

# Phase 07 Plan 02: System State Screens Summary

**One-liner:** Maintenance modal (env-var triggered), update required modal, React error boundary, and shimmer skeleton components wired into root layout.

## What Was Built

System-level UI that handles app-wide failure and loading states:

1. **`/api/system-status`** — Server-side GET endpoint reads `SYSTEM_MAINTENANCE` and `SYSTEM_UPDATE_REQUIRED` from `process.env` and returns JSON booleans. Keeps env vars server-only (no `NEXT_PUBLIC_` prefix required).

2. **`MaintenanceModal`** — AlertDialog with Wrench icon (#FF9800), "System Under Maintenance" title, body text, and non-dismissible Ok button (bg-[#FFE600]). Props: `open`, `onClose`. Dismissing records local state so it doesn't re-appear until next navigation.

3. **`UpdateRequiredModal`** — AlertDialog with Download icon (#0091EA), "Software Update" title, body text, and two-button row: Quit (outline) + Now (yellow). Non-dismissible via overlay.

4. **`SystemStateChecker`** — Client component mounted at root layout level. Fetches `/api/system-status` once on mount; silently fails on network error. Renders both modals conditionally.

5. **`AppErrorBoundary`** — Class-based React error boundary for inline use within specific component subtrees. Catches render errors, shows AlertCircle icon + "Something went wrong" + "Try Again" button that resets error state. Accepts optional `fallback` prop.

6. **`src/app/error.tsx`** — Next.js route-segment error boundary page. Full-screen (#FAFAFA), AlertCircle (#F44336), "Try Again" button calls `reset()` from Next.js error boundary props.

7. **`src/app/global-error.tsx`** — Global error boundary with own html/body tags (Next.js requirement). Inline styles used (Tailwind classes not available at global error level before CSS loads).

8. **`ProfileMenuSkeleton`** — Yellow header (h-32) with 72px circle skeleton + name bar skeleton. Three sections each with heading and 4 row skeletons (h-14 rounded-xl).

9. **`CardPageSkeleton`** — 343x200 card rectangle, 2-button action row, 3-row info block. All using animate-pulse.

10. **`profile/loading.tsx`** and **`profile/card/loading.tsx`** — Next.js loading files rendering respective skeletons.

11. **`src/app/layout.tsx`** — `SystemStateChecker` added inside `NextIntlClientProvider` after `Toaster`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Base UI AlertDialogContent does not support `onOpenAutoFocus`**
- **Found during:** Task 1 TypeScript check
- **Issue:** Plan specified `onOpenAutoFocus={(e) => e.preventDefault()}` to suppress auto-focus, but Base UI's `@base-ui/react/alert-dialog` Popup component uses `initialFocus` prop (not Radix UI's `onOpenAutoFocus`)
- **Fix:** Replaced `onOpenAutoFocus` with `initialFocus={false}` on AlertDialogContent in both maintenance-modal.tsx and update-required-modal.tsx
- **Files modified:** src/components/features/maintenance-modal.tsx, src/components/features/update-required-modal.tsx
- **Commit:** add228f

## Known Stubs

None — all components are fully wired. System modals trigger from real env vars via API endpoint.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | add228f | feat(07-02): system modals and env var checker |
| 2 | 575029c | feat(07-02): error boundary, loading skeletons, and root layout wiring |

## Self-Check: PASSED

All 10 created files verified on disk. Both task commits (add228f, 575029c) confirmed in git log.
