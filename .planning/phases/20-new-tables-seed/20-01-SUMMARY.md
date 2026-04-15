---
phase: 20-new-tables-seed
plan: "01"
subsystem: data-layer
tags: [drizzle, notifications, supabase, migration, rls]
dependency_graph:
  requires: []
  provides: [notifications-drizzle-table, notifications-sql-migration, notifications-api-drizzle]
  affects: [src/app/api/notifications/route.ts, src/db/schema.ts]
tech_stack:
  added: []
  patterns: [drizzle-select-where-orderby, drizzle-update-set-where, supabase-auth-getuser]
key_files:
  created:
    - supabase/migrations/20260415_add_notifications.sql
  modified:
    - src/db/schema.ts
    - src/app/api/notifications/route.ts
decisions:
  - notifications table uses uuid PK with defaultRandom() matching wallets/transactions pattern
  - Drizzle isRead boolean maps to is_read column; camelCase in TS, snake_case in DB
  - Auth remains via supabase.auth.getUser(); only data queries migrated to Drizzle (consistent with transactions route pattern)
  - DEMO_NOTIFICATIONS shape preserved unchanged — isDemoMode branches untouched
metrics:
  duration: 98s
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_modified: 3
---

# Phase 20 Plan 01: Add Notifications Drizzle Schema + SQL Migration Summary

**One-liner:** notifications Drizzle table + idempotent SQL migration with RLS + API route rewritten from raw Supabase client to Drizzle ORM

## What Was Built

Satisfied DATA-04: the `notifications` table is now queryable per user with read/unread status via Drizzle ORM.

### Task 1: Drizzle Schema + SQL Migration

Added `notifications` export to `src/db/schema.ts` following the established `pgTable` pattern with `timestamptz` alias:

```typescript
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  deepLink: text('deep_link'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
})
```

Created `supabase/migrations/20260415_add_notifications.sql` — idempotent (`IF NOT EXISTS`), includes:
- `CREATE TABLE` with FK to `user_profiles(id) ON DELETE CASCADE`
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Policy: `Users view own notifications` (SELECT scoped to `auth.uid() = user_id`)
- Policy: `Users update own notifications` (UPDATE scoped to `auth.uid() = user_id`)
- Composite index: `idx_notifications_user_id` on `(user_id, created_at DESC)`

### Task 2: Rewrite notifications API route

Replaced raw Supabase client data queries in `src/app/api/notifications/route.ts` with Drizzle:

- **GET**: `db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50)`
- **PATCH (all)**: `db.update(notifications).set({ isRead: true }).where(and(eq userId, eq isRead:false))` — atomic bulk mark-as-read
- **PATCH (single)**: `db.update(notifications).set({ isRead: true }).where(and(eq id, eq userId))` — user-scoped single update
- Removed commented-out SQL block from top of file (lines 1–17) — schema now lives in migration file
- `isDemoMode` branches preserved and return `DEMO_NOTIFICATIONS` unchanged

Auth pattern kept as `supabase.auth.getUser()` — consistent with transactions route.

## Deviations from Plan

### Auto-added items

The linter/editor also appended a `vouchers` table to `src/db/schema.ts` as part of the same phase's schema work. This was included in task 1's commit as it is in-scope for phase 20 and does not conflict with plan 01's goals. No plan-specified behavior was altered.

## Known Stubs

None. The route returns live Drizzle queries for authenticated users; DEMO_NOTIFICATIONS is intentional demo data, not a stub.

## Self-Check: PASSED

- FOUND: src/db/schema.ts (notifications table exported)
- FOUND: supabase/migrations/20260415_add_notifications.sql
- FOUND: src/app/api/notifications/route.ts (Drizzle queries)
- FOUND: .planning/phases/20-new-tables-seed/20-01-SUMMARY.md
- FOUND commit 9016a4b: feat(20-01): add notifications Drizzle schema + SQL migration
- FOUND commit 5ce1748: feat(20-01): rewrite notifications API route to use Drizzle
- Build: passed with zero TypeScript errors
