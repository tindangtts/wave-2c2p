---
phase: 07-profile-card-system-states
plan: "01"
subsystem: profile
tags: [profile, i18n, logout, static-pages, settings]
dependency_graph:
  requires: []
  provides: [profile-hub, profile-i18n, profile-components, profile-sub-pages]
  affects: [profile-page, navigation, auth-session]
tech_stack:
  added: []
  patterns: [ProfileHeader, ProfileMenuSection, ProfileMenuItem, shadcn-switch, useLocale-badge]
key_files:
  created:
    - messages/en/profile.json
    - messages/th/profile.json
    - messages/mm/profile.json
    - src/components/features/profile-header.tsx
    - src/components/features/profile-menu-section.tsx
    - src/components/features/profile-menu-item.tsx
    - src/app/(main)/profile/information/page.tsx
    - src/app/(main)/profile/contact-us/page.tsx
    - src/app/(main)/profile/limits-fees/page.tsx
    - src/app/(main)/profile/terms/page.tsx
    - src/app/(main)/profile/privacy/page.tsx
    - src/app/(main)/profile/faq/page.tsx
  modified:
    - src/i18n/request.ts
    - src/app/(main)/profile/page.tsx
decisions:
  - Profile page uses 'use client' + useEffect for user data fetch via Supabase browser client — avoids server component complexity while matching existing home page patterns
  - Logout calls clearAll/reset on each Zustand store explicitly — no shared reset abstraction needed since stores have different method names
  - Language badge derived from useLocale() — zero additional state, always accurate
  - Information page fetches first_name/last_name/phone/date_of_birth from user_profiles table
  - ProfileMenuItem uses border-b on each row rather than ml-14 divider — simpler and consistent with existing patterns
metrics:
  duration: 6
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_changed: 14
---

# Phase 7 Plan 01: Profile Hub Page Summary

Profile menu page rewritten with Pencil-matching yellow header, avatar initials, 3 sectioned menu lists (Biometrics/Settings/Help & Support), logout with full session and Zustand store cleanup, and 6 navigable static sub-pages, all backed by complete i18n for EN/TH/MM.

## What Was Built

### Task 1: i18n Messages and Reusable Profile Components

- **`messages/en/profile.json`** — Complete copywriting contract: menu labels, information fields, changePhone flow, changePasscode flow, language selector, referFriends, notifications, contactUs, limitsFees, terms, privacy, faq, card face UI, system modals (maintenance/update/error), logout, version string
- **`messages/th/profile.json`** and **`messages/mm/profile.json`** — Full Thai and Myanmar translations with same key structure
- **`src/i18n/request.ts`** — Added `profile` namespace import alongside existing namespaces
- **`ProfileHeader`** — Yellow `bg-[#FFE600]` header with `#0091EA` 20px bold title, 72px avatar circle with 24px bold `#212121` initials, 16px bold `#212121` full name below
- **`ProfileMenuSection`** — Section heading: 12px `#9E9E9E` uppercase, `letter-spacing: 0.08em`, wraps children
- **`ProfileMenuItem`** — 56px row with leading `#757575` 24px icon, 16px `#212121` label, optional trailing badge pill (`#0091EA` on `#E3F2FD`), `ChevronRight` 20px `#9E9E9E`, `border-b #E0E0E0` divider

### Task 2: Profile Menu Page, Logout, and Static Sub-pages

- **`src/app/(main)/profile/page.tsx`** — Full rewrite: ProfileHeader with user name fetched from Supabase `user_profiles`, 3 ProfileMenuSection blocks with 12 ProfileMenuItem rows (correct lucide icons per UI-SPEC), language badge from `useLocale()`, logout button (`border-[#F44336] text-[#F44336] rounded-full h-12 font-bold`), version text
- **Logout flow** — `supabase.auth.signOut()` → `useRegistrationStore.getState().clearAll()` → `useKYCStore.getState().clearAll()` → `useTransferStore.getState().reset()` → `useWalletOpsStore.getState().resetTopup()` + `resetWithdraw()` → `router.push('/login')`
- **`profile/information`** — Read-only fields (Full Name, Phone Number, Date of Birth) from Supabase, 12px label / 16px value pattern, `border-b #E0E0E0` rows
- **`profile/contact-us`** — Call center 1234 (tel: link), LINE @2c2pwave (line.me link), email support@2c2pwave.com (mailto: link)
- **`profile/limits-fees`** — Transfer Limits section (daily 50,000 THB, monthly 200,000 THB) + Fees section (transfer 99 THB, top-up free, withdrawal 25 THB)
- **`profile/terms`** — Terms and Conditions with 5 section headings + body text
- **`profile/privacy`** — Privacy and Policy with 5 section headings + body text
- **`profile/faq`** — Q&A Session with 5 items (question heading + answer body)

All pages use `useTranslations('profile')` and render BackHeader with correct title.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- **Biometrics toggle** (`src/app/(main)/profile/page.tsx`) — `biometricsEnabled` state is local only, no persistence. Intentional per CONTEXT.md deferred items ("Real biometrics integration (WebAuthn)"). The toggle renders correctly but does not persist between sessions. Future plan will wire to WebAuthn/Passkeys.
- **Information page phone field** — reads `phone` column from `user_profiles`. If the column is populated as a different field name (e.g., `phone_number`), the value will show "—". The Supabase schema in `.planning/supabase-schema.sql` should be the source of truth.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `bfa805e` | feat(07-01): i18n messages and reusable profile components |
| 2 | `aedd5fc` | feat(07-01): profile menu page rewrite, logout, and static sub-pages |

## Self-Check: PASSED
