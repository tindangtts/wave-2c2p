---
phase: 13-engagement-auth
verified: 2026-04-15T06:00:00Z
status: passed
score: 13/13 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Open /profile/refer-friends on a mobile device and tap WhatsApp share button"
    expected: "WhatsApp opens pre-filled with referral text and URL"
    why_human: "window.open URL scheme requires live device; can't confirm app launches programmatically"
  - test: "On an enrolled device, navigate to passcode screen and tap the biometric button"
    expected: "Device biometric prompt appears; on success, app redirects to /home"
    why_human: "WebAuthn ceremony requires hardware authenticator; cannot execute in CI"
  - test: "Enable biometrics from Profile > Security; check the toggle persists on re-visit"
    expected: "Toggle stays enabled across app restarts because webauthn_credential_id is stored in DB"
    why_human: "Requires Supabase DB with migrated columns (webauthn_credential_id etc.)"
---

# Phase 13: Engagement & Auth Verification Report

**Phase Goal:** Users stay informed through an in-app notification inbox, share referral rewards via social channels, and can authenticate with device biometrics instead of typing a passcode
**Verified:** 2026-04-15T06:00:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can see referred friends count and total bonus on refer-friends page | VERIFIED | `refer-friends/page.tsx` renders 2-card stats grid from `useSWR('/api/referral/stats')`; referredCount and totalBonusTHB displayed |
| 2 | User can share referral link via WhatsApp, Line, or copy-to-clipboard | VERIFIED | `handleWhatsApp` opens `wa.me`, `handleLine` opens `line.me`, `handleCopyLink` writes to clipboard; all wired to buttons |
| 3 | GET /api/notifications returns list with id, type, title, body, is_read, deep_link, created_at | VERIFIED | `notifications/route.ts` returns `DEMO_NOTIFICATIONS` (4 items) in demo mode; real mode queries Supabase with all fields |
| 4 | PATCH /api/notifications marks single or all notifications read | VERIFIED | PATCH handler accepts `{ id }` or `{ all: true }`; real mode updates Supabase; demo returns `{ success: true }` |
| 5 | Bell icon in TopHeader shows red badge with unread count when count > 0 | VERIFIED | `top-header.tsx` fetches `/api/notifications` via useSWR; conditional badge span with `bg-red-500`, 99+ cap |
| 6 | Tapping bell navigates to /home/notifications | VERIFIED | `onClick={() => router.push('/home/notifications')}` on bell button in `top-header.tsx` |
| 7 | Notification inbox lists notifications with unread items highlighted | VERIFIED | `home/notifications/page.tsx` renders list with `bg-[#E3F2FD]` for unread rows and blue dot indicator |
| 8 | User can tap Mark all as read | VERIFIED | `markAllRead()` with optimistic mutate + PATCH `{ all: true }`; button shown only when unreadCount > 0 |
| 9 | Tapping a notification marks it read and navigates to deep_link | VERIFIED | `handleNotificationPress` calls `markRead(n.id)` then `router.push(n.deep_link)` if present |
| 10 | Profile biometrics toggle calls /api/auth/webauthn/register on enable | VERIFIED | `handleBiometricToggle` in `profile/page.tsx` fetches `POST /api/auth/webauthn/register` then `register/verify`; availability gated via `isUserVerifyingPlatformAuthenticatorAvailable` |
| 11 | Passcode login page shows biometric button if enrolled AND platform supports it | VERIFIED | `passcode/page.tsx` checks `webauthn_credential_id` from DB AND `isUserVerifyingPlatformAuthenticatorAvailable`; `biometricAvailable` state gates Fingerprint button render |
| 12 | Biometric login calls authenticate/verify and redirects to /home on success | VERIFIED | `handleBiometricLogin` calls `POST /api/auth/webauthn/authenticate` then `authenticate/verify`; `router.push('/home')` on `verifyRes.ok` |
| 13 | Biometric unavailability or failure falls back gracefully to passcode | VERIFIED | On failure: `setError(t('passcode.biometricFailed'))` + `setBiometricAvailable(false)` hides button; passcode keypad always present |

**Score: 13/13 truths verified**

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/api/referral/stats/route.ts` | GET endpoint returning referredCount, totalBonusSatang, referralCode | VERIFIED | 57 lines; demo + real Supabase query; exports `GET` |
| `src/app/(main)/profile/refer-friends/page.tsx` | Referral page with stats display and social share buttons | VERIFIED | 135 lines; useSWR fetch, 2-card stats grid, WhatsApp/Line/Copy buttons |
| `src/app/api/notifications/route.ts` | GET list + PATCH mark-read for authenticated user | VERIFIED | 148 lines; exports `GET` and `PATCH`; DEMO_NOTIFICATIONS constant; real Supabase queries |
| `src/types/index.ts` | Notification interface | VERIFIED | `NotificationType` union at line 140, `Notification` interface at line 142 |
| `src/app/(main)/home/notifications/page.tsx` | Notification inbox with list and mark-read actions | VERIFIED | 113 lines; useSWR, optimistic mutate, markAllRead, empty state, list with unread highlight |
| `src/components/layout/top-header.tsx` | Bell icon with unread badge and navigation | VERIFIED | useSWR unread count, conditional red badge, `router.push('/home/notifications')` on click |
| `src/app/api/auth/webauthn/register/route.ts` | POST: generate WebAuthn registration options | VERIFIED | 58 lines; `generateRegistrationOptions` with platform attachment; challenge stored in DB |
| `src/app/api/auth/webauthn/register/verify/route.ts` | POST: verify registration + store credential | VERIFIED | 97 lines; `verifyRegistrationResponse`; stores credential_id, public_key (base64url), counter; clears challenge |
| `src/app/api/auth/webauthn/authenticate/route.ts` | POST: generate authentication options | VERIFIED | 59 lines; `generateAuthenticationOptions`; credential from user_profiles; challenge stored |
| `src/app/api/auth/webauthn/authenticate/verify/route.ts` | POST: verify authentication + update counter | VERIFIED | 101 lines; `verifyAuthenticationResponse`; updates counter; clears challenge |
| `src/app/(main)/profile/page.tsx` | Biometrics toggle with handleBiometricToggle | VERIFIED | `startRegistration` imported; toggle calls `handleBiometricToggle`; availability check; enroll/revoke flows |
| `src/app/(auth)/passcode/page.tsx` | Passcode page with conditional biometric button | VERIFIED | `isUserVerifyingPlatformAuthenticatorAvailable` checked; `biometricAvailable` state; Fingerprint button; `handleBiometricLogin` |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `refer-friends/page.tsx` | `/api/referral/stats` | `useSWR` | WIRED | Line 23: `useSWR<ReferralStats>('/api/referral/stats', fetcher)` |
| `refer-friends/page.tsx` | WhatsApp/Line URL schemes | `window.open` | WIRED | Line 53: `wa.me`, Line 57: `line.me/R/msg/text/` |
| `top-header.tsx` | `/home/notifications` | `router.push` on bell click | WIRED | `onClick={() => router.push('/home/notifications')}` |
| `home/notifications/page.tsx` | `/api/notifications` | `useSWR` | WIRED | `useSWR<{ notifications: Notification[] }>('/api/notifications', ...)` |
| `home/notifications/page.tsx` | `/api/notifications` (PATCH) | `fetch` in markRead/markAllRead | WIRED | Both functions call `fetch('/api/notifications', { method: 'PATCH', ... })` |
| `profile/page.tsx` | `/api/auth/webauthn/register` | `fetch POST` on toggle enable | WIRED | Line 94: `fetch("/api/auth/webauthn/register", { method: "POST" })` |
| `passcode/page.tsx` | `/api/auth/webauthn/authenticate` | `fetch POST` on biometric press | WIRED | Line 131: `fetch('/api/auth/webauthn/authenticate', { method: 'POST' })` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `refer-friends/page.tsx` | `stats` (ReferralStats) | `GET /api/referral/stats` → demo returns `{ referredCount: 3, totalBonusSatang: 30000 }` | Yes — demo constant; real queries `referrals` table | FLOWING |
| `home/notifications/page.tsx` | `notifications` (Notification[]) | `GET /api/notifications` → demo returns 4 items | Yes — DEMO_NOTIFICATIONS array with 4 real-looking items | FLOWING |
| `top-header.tsx` | `unreadCount` | `GET /api/notifications` (same endpoint) | Yes — same DEMO_NOTIFICATIONS, 2 unread filtered | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| `@simplewebauthn/browser` and `@simplewebauthn/server` installed | `ls node_modules/@simplewebauthn` + `package.json` grep | Both `^13.3.0` present | PASS |
| `Notification` interface exported from `src/types/index.ts` | `grep "interface Notification"` | Line 142 confirmed | PASS |
| `GET /api/notifications` exports `GET` and `PATCH` | File read | Both exported functions found | PASS |
| TopHeader contains `home/notifications` routing | `grep "home/notifications"` | Confirmed in `top-header.tsx` | PASS |
| WebAuthn 4 route files exist | `ls src/app/api/auth/webauthn/` | register/, register/verify/, authenticate/, authenticate/verify/ all present | PASS |
| All 7 requirement IDs in REQUIREMENTS.md marked complete | `grep` against requirements file | REF-01, REF-02, NOTIF-01, NOTIF-02, NOTIF-03, AUTH-01, AUTH-02 all `[x]` | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| REF-01 | 13-01-PLAN.md | User can see referral stats (count of referred friends, bonus earned) | SATISFIED | Stats card grid in `refer-friends/page.tsx` fed by `/api/referral/stats` |
| REF-02 | 13-01-PLAN.md | User can share referral via WhatsApp, Line, or copy link | SATISFIED | `handleWhatsApp` (wa.me), `handleLine` (line.me), `handleCopyLink` (clipboard) all wired |
| NOTIF-01 | 13-02-PLAN.md, 13-03-PLAN.md | User can view notification inbox from home screen bell icon | SATISFIED | Bell in TopHeader navigates to `/home/notifications`; inbox page fully implemented |
| NOTIF-02 | 13-02-PLAN.md, 13-03-PLAN.md | User sees unread badge count on notification bell | SATISFIED | TopHeader fetches unread count; red badge rendered conditionally |
| NOTIF-03 | 13-02-PLAN.md, 13-03-PLAN.md | User can mark notifications as read | SATISFIED | Individual mark-read + mark-all-read via PATCH endpoint; optimistic UI updates |
| AUTH-01 | 13-04-PLAN.md | User can enable biometric login from profile settings | SATISFIED | Profile toggle calls WebAuthn register ceremony; availability gated; disable clears credential |
| AUTH-02 | 13-04-PLAN.md | User can authenticate with biometrics instead of passcode on login | SATISFIED | Passcode page shows Fingerprint button when enrolled; calls authenticate/verify; redirects to /home on success |

All 7 requirements claimed across plans are present in REQUIREMENTS.md and implemented.

---

## Anti-Patterns Found

No blockers or warnings found. Scanned all 8 modified/created source files for TODO, FIXME, PLACEHOLDER, `return null`, `return {}`, `return []`, empty handlers, and hardcoded empty props. None detected.

Notable observations (Info only):
- `register/verify/route.ts` demo mode still creates a Supabase client and runs an update even in demo mode — this is intentional (writes mock credential so toggle state persists in demo).
- Passcode page checks `webauthn_credential_id` but does NOT separately check the profile query for `&&` with the platform availability call — this is safe because `setBiometricAvailable(platformAvailable)` only runs inside the `if (profile?.webauthn_credential_id)` guard.

---

## Human Verification Required

### 1. WhatsApp and Line Share Flow

**Test:** Open `/profile/refer-friends` on Android or iPhone, tap "Share on WhatsApp"
**Expected:** WhatsApp opens with pre-filled message "Use my referral code WAVE2C2P to join 2C2P Wave!" plus the register URL
**Why human:** `window.open` with `wa.me` deep-link requires a live device with WhatsApp installed; cannot execute in CI

### 2. Biometric Enrollment on Real Device

**Test:** In demo mode on a PWA-installed iPhone (Face ID) or Android (fingerprint), go to Profile > Security, enable "Biometrics". Confirm Face ID/fingerprint prompt appears.
**Expected:** Device authenticator prompt appears; on success, toggle stays enabled and a success toast shows
**Why human:** `startRegistration` triggers a browser WebAuthn ceremony that requires actual hardware; no stub in browser environment

### 3. Biometric Login after Enrollment

**Test:** After enrolling biometrics, log out and return to passcode screen. Confirm Fingerprint button is visible; tap it.
**Expected:** Biometric prompt appears; on success, app navigates to `/home`; on failure, error message shows and button hides
**Why human:** Requires enrolled credential in real DB; WebAuthn `startAuthentication` needs browser security context

### 4. Unread Badge Persistence

**Test:** Open app on home screen. Confirm red badge on bell shows "2" in demo mode. Tap bell, tap one notification. Go back to home. Confirm badge decrements to "1".
**Expected:** Optimistic UI + SWR revalidation keeps badge in sync after mark-read
**Why human:** Requires visual inspection of badge count change across navigation

---

## Gaps Summary

No gaps. All 13 observable truths verified, all artifacts exist and are substantive, all key links confirmed wired, data flows through all three rendering paths. All 7 requirement IDs satisfied with implementation evidence.

---

_Verified: 2026-04-15T06:00:00Z_
_Verifier: Claude (gsd-verifier)_
