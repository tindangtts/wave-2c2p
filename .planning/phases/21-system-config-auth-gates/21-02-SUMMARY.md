---
phase: 21-system-config-auth-gates
plan: "02"
subsystem: auth
tags: [auth-gate, session, permanently-rejected, otp, drizzle, supabase]
dependency_graph:
  requires: []
  provides: [permanently_rejected_gate, single_session_enforcement]
  affects: [src/app/api/auth/otp/send/route.ts, src/app/(auth)/login/page.tsx, src/app/api/auth/otp/verify/route.ts]
tech_stack:
  added: []
  patterns: [supabase-admin-signout, alert-dialog-modal, rejection-gate]
key_files:
  created:
    - supabase/migrations/20260415_add_permanently_rejected.sql
  modified:
    - src/db/schema.ts
    - src/app/api/auth/otp/send/route.ts
    - src/app/(auth)/login/page.tsx
    - src/app/api/auth/otp/verify/route.ts
    - .planning/supabase-schema.sql
decisions:
  - permanently_rejected check uses admin client to bypass RLS — phone column stores local digits only (no country code prefix)
  - signOut('others') failure is non-fatal — session was created; old sessions expire naturally; warning logged
  - RejectionModal is inline in login page using AlertDialog (no separate file) per plan specification
  - Real mode signOut guard checks userId !== undefined before calling admin API
metrics:
  duration: 189s
  completed: "2026-04-15T12:14:21Z"
  tasks: 2
  files: 5
---

# Phase 21 Plan 02: Auth Gates — Rejection Gate + Single Session Summary

**One-liner:** Permanently rejected user gate at OTP send (403 + blocking modal) with single-session enforcement via Supabase admin signOut('others') after every successful login.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | DB schema + migration | 324c04a | src/db/schema.ts, supabase/migrations/20260415_add_permanently_rejected.sql, .planning/supabase-schema.sql |
| 2 | Rejection gate + single session | f85d751 | src/app/api/auth/otp/send/route.ts, src/app/(auth)/login/page.tsx, src/app/api/auth/otp/verify/route.ts |

## What Was Built

### AUTH-04: Permanently Rejected Gate

**DB layer:** Added `permanently_rejected boolean NOT NULL DEFAULT false` to `user_profiles` table via idempotent `ADD COLUMN IF NOT EXISTS` migration. Column added to Drizzle `userProfiles` schema between `monthlyLimitSatang` and `createdAt`.

**API layer:** `/api/auth/otp/send` now performs a pre-OTP admin DB lookup before mock/real OTP dispatch. If `permanently_rejected = true`, returns `403 { error: 'permanently_rejected' }` immediately. Uses admin client to bypass RLS. New users (profile not found) pass through normally.

**UI layer:** Login page detects `data.error === 'permanently_rejected'` on non-OK response and sets `isRejected` state. Renders an inline `AlertDialog` modal with XCircle icon (red #F44336), title "Registration is Rejected", body text, and "Ok" dismiss button. Dismissing closes the modal and keeps the user on the login page.

### AUTH-05: Single Active Session Enforcement

**Verify route:** After every successful sign-in (both mock `signInWithPassword` and real `verifyOtp` paths), calls `admin.auth.admin.signOut(userId, 'others')`. This invalidates all tokens except the current session just created. The first device's token becomes invalid; Supabase returns 401 on next auth check and `updateSession` in proxy.ts redirects to /login.

**Error handling:** `signOut` failure is caught and logged as a warning (`console.warn`). The login flow completes normally regardless — the new session is already created before the `signOut` call.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all functionality fully wired.

## Self-Check: PASSED

- [x] `permanentlyRejected` column in `src/db/schema.ts` — FOUND
- [x] Migration file `supabase/migrations/20260415_add_permanently_rejected.sql` — FOUND
- [x] `permanently_rejected` check in `src/app/api/auth/otp/send/route.ts` — FOUND
- [x] `isRejected` state + XCircle + "Registration is Rejected" in login page — FOUND
- [x] `signOut.*others` in `src/app/api/auth/otp/verify/route.ts` (both paths) — FOUND
- [x] Commit 324c04a — FOUND
- [x] Commit f85d751 — FOUND
