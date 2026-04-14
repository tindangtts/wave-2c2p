---
phase: 07-profile-card-system-states
plan: 03
subsystem: profile-settings
tags: [profile, phone-change, passcode-change, language, referral, notifications, otp, next-intl]
dependency_graph:
  requires: [07-01]
  provides: [change-phone-flow, change-passcode-flow, language-selector, referral-page, notification-settings]
  affects: [profile-page, auth-apis]
tech_stack:
  added: []
  patterns: [multi-step-form, otp-flow, passcode-keypad-reuse, web-share-api, next-intl-locale-cookie, react-qr-code]
key_files:
  created:
    - src/app/api/auth/change-phone/route.ts
    - src/app/api/auth/verify-change-phone/route.ts
    - src/app/api/auth/change-passcode/route.ts
    - src/app/(main)/profile/change-phone/page.tsx
    - src/app/(main)/profile/change-passcode/page.tsx
    - src/components/features/language-selector.tsx
    - src/components/features/referral-card.tsx
    - src/components/features/notification-toggle-list.tsx
    - src/app/(main)/profile/language/page.tsx
    - src/app/(main)/profile/refer-friends/page.tsx
    - src/app/(main)/profile/notifications/page.tsx
  modified: []
decisions:
  - locale cookie name is "locale" (from routing.ts localeCookie config) — LanguageSelector sets document.cookie directly then calls router.refresh()
  - change-passcode page uses key={step} on PasscodeKeypad to force remount/reset between steps
  - ReferralCard uses static WAVE2C2P code — no user-ID-derived code (deferred: real referral system)
  - notification toggles are local state only — mock UI, no persistence
metrics:
  duration_minutes: 20
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 11
  files_modified: 0
---

# Phase 7 Plan 3: Profile Interactive Sub-Pages Summary

**One-liner:** Multi-step phone/passcode change flows + language locale switcher + referral QR + notification toggles, all reusing Phase 2 auth components.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Phone change + passcode change flows + mock APIs | 94c43f0 | 5 files |
| 2 | Language selector, referral page, notification settings | 921cf25 | 6 files |

## What Was Built

### Task 1: Phone Change + Passcode Change + APIs

**API Routes:**
- `POST /api/auth/change-phone` — validates phone + auth, mock 500ms delay, returns `{ success: true, message: "OTP sent" }`
- `POST /api/auth/verify-change-phone` — OTP "123456" always succeeds, updates `user_profiles.phone` in Supabase
- `POST /api/auth/change-passcode` — PBKDF2 verifies current passcode, hashes new via `hashPasscode`, saves to DB; 5-attempt lockout with 30-min timeout matches existing `passcode/verify` pattern

**Pages:**
- `change-phone/page.tsx`: 2-step flow (`1 → 2 → 'success'`). Step 1: country code Select + phone Input. Step 2: InputOTP 6-slot with 60s resend timer + shake animation on error. Success: check icon + "Back to Profile" CTA.
- `change-passcode/page.tsx`: 3-step flow (`1 → 2 → 3 → 'success'`). Reuses `PasscodeKeypad` with `key={step}` prop to force remount. Step 1 POSTs to `/api/auth/passcode/verify` (reusing existing endpoint). Step 3 compares with stored new passcode before POSTing to `/api/auth/change-passcode`.

### Task 2: Language Selector + Referral + Notifications

**Components:**
- `LanguageSelector`: 3 rows (EN 🇬🇧, TH 🇹🇭, MM 🇲🇲 with `lang="my"`). Active row `bg-[#FFE600]` + Check icon `text-[#0091EA]`. Sets `document.cookie = 'locale=...'` then `router.refresh()` — next-intl picks up new cookie on re-render.
- `ReferralCard`: White `rounded-2xl shadow-md` card with code (24px bold, tracking-[0.12em]), `react-qr-code` at 160x160, monthly count label.
- `NotificationToggleList`: 3 toggle rows (push/email/sms), `Switch` from shadcn with `data-[state=checked]:bg-[#0091EA]`, local `useState` mock.

**Pages:**
- `language/page.tsx`: BackHeader + `LanguageSelector` with `useLocale()` for current locale.
- `refer-friends/page.tsx`: BackHeader + instruction + `ReferralCard` + Share CTA. Uses `navigator.share()` with `navigator.clipboard.writeText()` fallback + sonner toast.
- `notifications/page.tsx`: BackHeader + `NotificationToggleList` in white card + Save CTA shows `toast.success('Settings saved')`.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `ReferralCard` uses hardcoded `WAVE2C2P` code — no user-specific referral code yet (no referrals table in schema). Future plan should add referral system and derive code from user ID.
- Notification settings use `localStorage`-less local state — toggles reset on page reload. Deferred until real notification backend exists.

## Self-Check: PASSED

Files verified:
- src/app/api/auth/change-phone/route.ts — FOUND
- src/app/api/auth/verify-change-phone/route.ts — FOUND
- src/app/api/auth/change-passcode/route.ts — FOUND
- src/app/(main)/profile/change-phone/page.tsx — FOUND
- src/app/(main)/profile/change-passcode/page.tsx — FOUND
- src/components/features/language-selector.tsx — FOUND
- src/components/features/referral-card.tsx — FOUND
- src/components/features/notification-toggle-list.tsx — FOUND
- src/app/(main)/profile/language/page.tsx — FOUND
- src/app/(main)/profile/refer-friends/page.tsx — FOUND
- src/app/(main)/profile/notifications/page.tsx — FOUND

Commits verified:
- 94c43f0 — feat(07-03): phone change flow, passcode change flow, and mock APIs
- 921cf25 — feat(07-03): language selector, referral page, and notification settings
