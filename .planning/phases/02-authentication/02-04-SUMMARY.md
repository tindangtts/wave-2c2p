---
phase: 02-authentication
plan: "04"
subsystem: auth
tags: [passcode, keypad, registration, visibility-hook, app-lock]
dependency_graph:
  requires: [02-02, 02-03]
  provides: [passcode-keypad, passcode-create-page, passcode-login-page, passcode-api-routes, app-visibility-hook]
  affects: [main-layout, registration-flow, auth-flow]
tech_stack:
  added: []
  patterns:
    - PBKDF2 hash via passcode.ts (plain utility, no use server directive)
    - Base UI AlertDialog (not Radix — no asChild support)
    - sessionStorage-based app backgrounding detection
    - AppVisibilityGuard client wrapper in server layout
key_files:
  created:
    - src/components/features/passcode-keypad.tsx
    - src/app/(auth)/register/create-passcode/page.tsx
    - src/app/(auth)/passcode/page.tsx
    - src/app/api/auth/passcode/setup/route.ts
    - src/app/api/auth/passcode/verify/route.ts
    - src/hooks/use-app-visibility.ts
  modified:
    - src/app/(main)/layout.tsx
    - src/lib/auth/passcode.ts
decisions:
  - "'use server' removed from passcode.ts — pure sync utility functions used in API route handlers must not be Server Actions (Next.js requires Server Actions to be async)"
  - "AlertDialogTrigger has no asChild prop (Base UI, not Radix) — trigger renders directly as button element with className"
  - "AppVisibilityGuard pattern: inline client component in layout file wraps children, calling useAppVisibility() hook as side effect"
metrics:
  duration: ~10 minutes
  completed: 2026-04-14
  tasks_completed: 2
  tasks_total: 3
  files_created: 6
  files_modified: 2
---

# Phase 02 Plan 04: Passcode Flow + App Visibility Lock Summary

**One-liner:** 6-dot passcode keypad with PBKDF2 setup/verify API routes, create+confirm registration step, returning-user lock screen, and 5-minute background detection.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | PasscodeKeypad + API routes | 04ee756 | passcode-keypad.tsx, setup/route.ts, verify/route.ts |
| 2 | Pages + visibility hook + layout | de7d573 | create-passcode/page.tsx, passcode/page.tsx, use-app-visibility.ts, layout.tsx |
| 3 | Human verify checkpoint | auto-approved | — |

## What Was Built

### PasscodeKeypad Component (`src/components/features/passcode-keypad.tsx`)
- 6-dot display row: filled=`#FFE600` border-transparent, unfilled=border-`#E0E0E0`
- 3x4 numeric grid: keys 1-9, empty cell, 0, backspace (Delete icon)
- Key size: `w-16 h-16` (64px) rounded-full per UI-SPEC
- Interaction: digit appends to value, 100ms delay then `onComplete` at 6 digits
- `animate-shake` on error, `animate-pulse` on loading
- Immediate dot masking — digits never displayed
- Full aria-labels: digit keys labeled "1"–"9"/"0", backspace "Delete digit"

### Passcode Setup API (`/api/auth/passcode/setup`)
- POST validates 6-digit format, authenticates via `supabase.auth.getUser()`
- Calls `hashPasscode()` (PBKDF2 310k iterations, sha256)
- Updates `user_profiles`: `passcode_hash`, `registration_complete=true`, `registration_step=3`, `passcode_attempts=0`

### Passcode Verify API (`/api/auth/passcode/verify`)
- POST with lock check: 423 if `passcode_locked_at` within 30 minutes
- Auto-resets lock if 30+ minutes elapsed
- Calls `verifyPasscode()` with timing-safe comparison
- Wrong: increments `passcode_attempts`, locks at 5 with `passcode_locked_at=now()`
- Returns `remaining` attempts and `locked` boolean on 401

### Create Passcode Page (`/register/create-passcode`)
- Two-state machine: 'create' → 'confirm'
- Mismatch: shows error, shakes, resets to 'create' after 1s delay
- Match: calls setup API, clears Zustand registration store, redirects `/home`

### Passcode Login Page (`/passcode`)
- Avatar circle (56px) with user initial from `user_profiles.first_name`
- Greeting + instruction from i18n
- Handles 401 (wrong passcode with remaining count) and 423 (locked → redirect /login after 3s)
- Logout via AlertDialog confirmation then `supabase.auth.signOut()`

### App Visibility Hook (`src/hooks/use-app-visibility.ts`)
- `visibilitychange` event listener
- Hidden: saves `Date.now()` to `sessionStorage['wave-hidden-at']`
- Visible: reads elapsed, redirects `/passcode` if >5 minutes (300000ms)
- Excluded paths: `/login`, `/otp`, `/register`, `/passcode` (prevents loops)

### Main Layout Update
- `AppVisibilityGuard` client component wraps children
- Calls `useAppVisibility()` as side effect
- Existing `BottomNav` unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed `'use server'` from passcode.ts**
- **Found during:** Task 2 build (`npm run build`)
- **Issue:** `src/lib/auth/passcode.ts` had `'use server'` directive making `hashPasscode`/`verifyPasscode` Server Actions. Next.js requires Server Actions to be async — sync exports under `'use server'` cause build error.
- **Fix:** Removed `'use server'` directive. These are pure Node.js crypto utilities imported by API route handlers — no Server Action semantics needed.
- **Files modified:** `src/lib/auth/passcode.ts`
- **Commit:** de7d573

**2. [Rule 1 - Bug] AlertDialogTrigger has no `asChild` prop**
- **Found during:** Task 2 TypeScript check
- **Issue:** This project uses Base UI (`@base-ui/react`) via shadcn base-nova preset, not Radix UI. Base UI's `AlertDialogTrigger` does not support `asChild` prop.
- **Fix:** Rendered `AlertDialogTrigger` directly with className instead of wrapping a `<button>` with `asChild`.
- **Files modified:** `src/app/(auth)/passcode/page.tsx`
- **Commit:** de7d573

## Known Stubs

None. All data is wired to real Supabase queries and PBKDF2 hash operations.

## Self-Check: PASSED

Files exist:
- `src/components/features/passcode-keypad.tsx` — FOUND
- `src/app/(auth)/register/create-passcode/page.tsx` — FOUND
- `src/app/(auth)/passcode/page.tsx` — FOUND
- `src/app/api/auth/passcode/setup/route.ts` — FOUND
- `src/app/api/auth/passcode/verify/route.ts` — FOUND
- `src/hooks/use-app-visibility.ts` — FOUND
- `src/app/(main)/layout.tsx` — MODIFIED

Commits exist:
- `04ee756` — feat(02-04): PasscodeKeypad + API routes
- `de7d573` — feat(02-04): pages + visibility hook + layout
