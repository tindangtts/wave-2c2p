---
phase: 02-authentication
plan: 02
subsystem: auth
tags: [otp, login, supabase, session, middleware]
dependency_graph:
  requires:
    - 02-01  # phoneSchema, createAdminClient, registration-store
  provides:
    - mock OTP send API
    - mock OTP verify API with real Supabase session
    - login page with Zod phone validation
    - OTP verification page with auto-submit
    - updated middleware guards
  affects:
    - 02-03  # registration pages will rely on OTP session cookie
    - 02-04  # passcode flows require authenticated session from OTP
tech_stack:
  added:
    - none (all deps already installed)
  patterns:
    - createServerClient cookie handler for session cookie injection in Route Handlers
    - sha256 deterministic password derivation for mock user creation
    - admin.auth.admin.listUsers() phone lookup (getUserByPhone does not exist)
    - Suspense boundary wrapping useSearchParams in OTP page
key_files:
  created:
    - src/app/api/auth/otp/send/route.ts
    - src/app/api/auth/otp/verify/route.ts
    - src/app/(auth)/otp/page.tsx
  modified:
    - src/app/(auth)/login/page.tsx
    - src/lib/supabase/middleware.ts
    - src/app/globals.css
decisions:
  - "admin.auth.admin.getUserByPhone does not exist in @supabase/auth-js — use listUsers({perPage:1000}) with .find() to locate user by phone"
  - "updateUserById used on existing users to keep derived password consistent with current MOCK_AUTH_SECRET"
  - "isLoginOnlyPage split from isAuthPage — /passcode excluded from authenticated-user redirect because returning users need the lock screen"
  - "Suspense boundary required around useSearchParams in OTP page per Next.js App Router rules"
metrics:
  duration: ~15 min
  completed: 2026-04-14
  tasks_completed: 2
  files_changed: 6
---

# Phase 02 Plan 02: Mock OTP Flow + Login/OTP Pages Summary

**One-liner:** Mock OTP flow with sha256-derived password and real Supabase session cookies, plus Zod-validated login page and auto-submit OTP verification screen.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Mock OTP send + verify API routes | dfb9a54 | api/auth/otp/send/route.ts, api/auth/otp/verify/route.ts |
| 2 | Login page rewrite + OTP page + middleware fix | 6db2be1 | (auth)/login/page.tsx, (auth)/otp/page.tsx, lib/supabase/middleware.ts, globals.css |

---

## What Was Built

### Task 1: Mock OTP API Routes

**`POST /api/auth/otp/send`**
- Validates `{ phone, countryCode }` with `phoneSchema` — 400 on failure
- Mock mode (`MOCK_OTP_AUTO_BYPASS !== 'false'`): returns `{ success: true, mock: true }`
- Real mode: calls `supabase.auth.signInWithOtp({ phone })`

**`POST /api/auth/otp/verify`**
- Mock mode: accepts only `'000000'` as token (401 otherwise)
- Looks up user by phone via `admin.auth.admin.listUsers()` + `.find()`
- Creates user via `admin.auth.admin.createUser` with `phone_confirm: true` if not found
- Updates existing user's derived password for consistency
- Signs in with `supabase.auth.signInWithPassword` using sha256-derived password
- Session cookies written to response via `@supabase/ssr` `createServerClient` cookie handler
- Creates `user_profiles` row if none exists (`registration_complete: false, registration_step: 1`)
- Returns `{ success, isNewUser, registrationComplete, registrationStep }`

### Task 2: UI Pages + Middleware

**Login Page (`/login`)**
- Rewrote scaffold: Zod `phoneSchema` validation on blur, inline error with `role="alert"`
- Country code `Select` (110px wide, 48px height), `aria-label` on trigger and items
- Phone `Input` with `type="tel"`, `inputMode="numeric"`, `autoComplete="tel-national"`
- CTA disabled until min digit count met (TH: 9, MM: 7)
- Loading state: `Loader2` spinner + i18n `cta.sendingOtp`
- On success: stores phone in `useRegistrationStore`, navigates to `/otp?phone=...&cc=...`
- All copy via `useTranslations('auth')`

**OTP Page (`/otp`)**
- Reads `phone` + `cc` from URL search params (wrapped in `Suspense` for Next.js compliance)
- `BackHeader` with `onBack` → `/login`
- `InputOTP` with 6 `InputOTPSlot` components (48x48px, `gap-2`)
- `autoComplete="one-time-code"` for iOS SMS autofill
- `onComplete` auto-submits on 6th digit entry
- Resend timer: 60s countdown → "Resend OTP" link after expiry
- Shake animation on error via `animate-shake` + `shakeKey` reset pattern
- Dev bypass notice rendered when `NODE_ENV === 'development'`
- Routes to `/register/personal-info` (new users), `/home` (returning), or correct step

**Middleware (`src/lib/supabase/middleware.ts`)**
- Added `/otp` to `isAuthPage` (unauthenticated allowed)
- New `isLoginOnlyPage` check: only `/login`, `/otp`, `/register` redirect authenticated users
- `/passcode` intentionally excluded from `isLoginOnlyPage` — needed for lock screen

**CSS (`globals.css`)**
- Added `@keyframes shake` (20/40/60/80% oscillation over 300ms)
- Added `.animate-shake` utility class

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `getUserByPhone` does not exist on `GoTrueAdminApi`**
- **Found during:** Task 1 TypeScript check
- **Issue:** Plan specified `admin.auth.admin.getUserByPhone(phone)` but this method does not exist in `@supabase/auth-js`; only `getUserById`, `listUsers`, `updateUserById`, `createUser`, `deleteUser` exist
- **Fix:** Used `admin.auth.admin.listUsers({ perPage: 1000 })` and `.find(u => u.phone === fullPhone)` to locate existing user by phone
- **Files modified:** `src/app/api/auth/otp/verify/route.ts`
- **Commit:** dfb9a54

**2. [Rule 2 - Missing Critical] Suspense boundary around `useSearchParams`**
- **Found during:** Task 2 — Next.js App Router requires `useSearchParams` to be wrapped in `Suspense` or it causes a CSR bailout warning and build issues
- **Fix:** Extracted page content into `OTPPageContent` component, wrapped with `<Suspense>` in the default export
- **Files modified:** `src/app/(auth)/otp/page.tsx`
- **Commit:** 6db2be1

---

## Known Stubs

None. All data flows are wired. The `listUsers` approach for phone lookup is a functional implementation, not a stub — it works correctly for development scale. At production scale, a phone index query would be more efficient, but this is acceptable for the mock flow.

---

## Self-Check: PASSED

Files exist:
- FOUND: src/app/api/auth/otp/send/route.ts
- FOUND: src/app/api/auth/otp/verify/route.ts
- FOUND: src/app/(auth)/otp/page.tsx
- FOUND: src/app/(auth)/login/page.tsx (modified)
- FOUND: src/lib/supabase/middleware.ts (modified)

Commits exist:
- dfb9a54: feat(02-02): add mock OTP send + verify API routes with real Supabase session
- 6db2be1: feat(02-02): login page, OTP verification page, middleware guards, shake animation
