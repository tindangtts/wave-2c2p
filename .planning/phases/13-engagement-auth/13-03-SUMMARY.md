---
phase: 13-engagement-auth
plan: 03
subsystem: ui
tags: [notifications, swr, next-intl, lucide, bell-badge]

# Dependency graph
requires:
  - phase: 13-engagement-auth-02
    provides: Notification type, /api/notifications GET/PATCH routes, profile.json notificationInbox keys

provides:
  - Notification inbox page at /home/notifications with unread highlighting and mark-read actions
  - TopHeader bell icon with live unread badge count and navigation to inbox

affects: [home, top-header, notification-flows]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useSWR with optimistic mutate for mark-read UI (false revalidation + revalidate after fetch)
    - Conditional red badge on icon buttons via absolute positioning

key-files:
  created:
    - src/app/(main)/home/notifications/page.tsx
  modified:
    - src/components/layout/top-header.tsx

key-decisions:
  - "TopHeader fetches /api/notifications with 30s dedupingInterval to minimise polling on home screen"
  - "Notification inbox uses 5s dedupingInterval for more responsive unread state after mark-read"
  - "Optimistic mutate (false) fires before PATCH then revalidates — keeps UI snappy on slow networks"

patterns-established:
  - "Bell badge: absolute span inside relative button, top-1.5 right-1.5, bg-red-500, 99+ cap"
  - "Notification list: rounded-2xl white card with border-b dividers, blue bg-[#E3F2FD] for unread rows"

requirements-completed: [NOTIF-01, NOTIF-02, NOTIF-03]

# Metrics
duration: 7min
completed: 2026-04-15
---

# Phase 13 Plan 03: Notification Inbox Summary

**Bell icon with live unread badge and /home/notifications inbox with optimistic mark-one/mark-all-read via PATCH /api/notifications**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-15T05:21:21Z
- **Completed:** 2026-04-15T05:28:32Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- TopHeader bell now fetches unread count from /api/notifications and renders a red badge (99+ capped) when count > 0
- Tapping bell navigates to /home/notifications via router.push
- Notification inbox page lists all notifications with unread rows highlighted blue, unread dot + "New" badge
- Mark-all-read button (shown only when unread > 0) calls PATCH /api/notifications with { all: true }
- Tapping a notification marks it read (PATCH with { id }) and follows deep_link if present
- Empty state renders Bell icon with instructional copy when no notifications exist

## Task Commits

1. **Task 1: TopHeader bell badge + navigation** - `629e9f9` (feat)
2. **Task 2: Notification inbox page** - `61dca3d` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/components/layout/top-header.tsx` - Added useSWR unread fetch, router.push on bell click, conditional red badge
- `src/app/(main)/home/notifications/page.tsx` - New inbox page with SWR, optimistic mark-read, empty state, list UI

## Decisions Made
- TopHeader uses 30s dedupingInterval to avoid excessive polling from the always-visible home header
- Notification inbox uses 5s dedupingInterval for more responsive feedback after mark-read actions
- Optimistic mutate(data, false) then revalidate pattern keeps the UI snappy without waiting for the PATCH response

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- NOTIF-01/02/03 complete; notification inbox and bell badge fully functional
- Plan 13-04 can proceed (final plan in phase 13)

---
*Phase: 13-engagement-auth*
*Completed: 2026-04-15*
