---
phase: 13-engagement-auth
plan: "02"
subsystem: api
tags: [notifications, supabase, i18n, next-intl, api-route]

requires:
  - phase: 04-home-wallet
    provides: wallet API pattern (createClient, isDemoMode, NextResponse)
  - phase: 07-profile-card-system-states
    provides: profile.json i18n structure

provides:
  - GET /api/notifications returning paginated notification list (demo: 4 items)
  - PATCH /api/notifications marking single or all notifications read
  - Notification and NotificationType TypeScript contracts in src/types/index.ts
  - notificationInbox i18n namespace in en/th/mm profile.json
  - notificationsBadge i18n key in en/th/mm home.json
  - Supabase DDL comment block with RLS policies and index

affects:
  - 13-03 (notification inbox UI builds against this API contract)
  - Any feature using Notification type from src/types/index.ts

tech-stack:
  added: []
  patterns:
    - "Demo-mode branching in API routes: isDemoMode check before Supabase auth"
    - "PATCH body typed as { id?: string; all?: boolean } for flexible mark-read"

key-files:
  created:
    - src/app/api/notifications/route.ts
  modified:
    - src/types/index.ts
    - messages/en/profile.json
    - messages/th/profile.json
    - messages/mm/profile.json
    - messages/en/home.json
    - messages/th/home.json
    - messages/mm/home.json

key-decisions:
  - "PATCH accepts { id } or { all: true } — single or bulk mark-read in one endpoint"
  - "Demo returns 4 fixed notifications (2 unread, 2 read) covering all type variants"
  - "Supabase DDL embedded as comment block in route file for discoverability"

patterns-established:
  - "notificationInbox namespace in profile.json — separate from notifications (settings toggle)"

requirements-completed:
  - NOTIF-01
  - NOTIF-02
  - NOTIF-03

duration: 5min
completed: 2026-04-15
---

# Phase 13 Plan 02: Notifications API Foundation Summary

**GET/PATCH /api/notifications with demo data, Notification TypeScript type, and full i18n strings across 3 locales — data layer ready for Plan 03 inbox UI**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-15T05:20:00Z
- **Completed:** 2026-04-15T05:25:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Notifications API route with GET (list, user-scoped, limit 50) and PATCH (mark-read single/all) handlers
- Notification and NotificationType TypeScript interfaces appended to src/types/index.ts
- notificationInbox i18n namespace added to all 3 locale profile.json files with type labels, empty state, mark-all-read strings
- notificationsBadge accessibility key added to all 3 locale home.json files

## Task Commits

1. **Task 1: Notification type + API route + Supabase DDL comment** - `70d7845` (feat)
2. **Task 2: Notification i18n strings (all 3 locales)** - `1e1efc4` (feat)

## Files Created/Modified
- `src/app/api/notifications/route.ts` - GET + PATCH handlers with demo data and real Supabase queries
- `src/types/index.ts` - NotificationType union and Notification interface appended
- `messages/en/profile.json` - notificationInbox namespace added
- `messages/th/profile.json` - notificationInbox namespace added (Thai)
- `messages/mm/profile.json` - notificationInbox namespace added (Myanmar)
- `messages/en/home.json` - notificationsBadge key added
- `messages/th/home.json` - notificationsBadge key added (Thai)
- `messages/mm/home.json` - notificationsBadge key added (Myanmar)

## Decisions Made
- PATCH accepts `{ id }` or `{ all: true }` — single endpoint covers both mark-one and mark-all flows
- Demo data has 2 unread + 2 read notifications covering all 4 notification types
- notificationInbox namespace kept separate from notifications (which is the settings toggle page namespace)

## Deviations from Plan

None - plan executed exactly as written. All artifacts were already implemented prior to this execution run; verification confirmed correctness and build passes.

## Issues Encountered

None.

## User Setup Required

Supabase table creation required before real (non-demo) mode works. The DDL is embedded as a comment block at the top of `src/app/api/notifications/route.ts`:

```sql
-- Run in Supabase SQL Editor:
-- create table if not exists public.notifications (...)
-- alter table public.notifications enable row level security;
-- create policy "Users view own notifications" ...
-- create policy "Users update own notifications" ...
-- create index idx_notifications_user_id ...
```

## Next Phase Readiness
- API contract fully defined — Plan 03 inbox UI can build against GET /api/notifications and PATCH /api/notifications
- Notification TypeScript type available from src/types/index.ts
- i18n strings ready in all 3 locales under profile.notificationInbox namespace

---
*Phase: 13-engagement-auth*
*Completed: 2026-04-15*
