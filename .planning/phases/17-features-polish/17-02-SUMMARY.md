---
phase: 17-features-polish
plan: "02"
subsystem: profile
tags: [spending-limits, profile, api, swr, i18n]
dependency_graph:
  requires: []
  provides: [spending-limits-api, spending-limits-page]
  affects: [profile-page]
tech_stack:
  added: []
  patterns: [swr-hook, zod-validation, tier-selector-ui]
key_files:
  created:
    - src/app/api/spending-limits/route.ts
    - src/hooks/use-spending-limits.ts
    - src/app/(main)/profile/spending-limits/page.tsx
  modified:
    - src/app/(main)/profile/page.tsx
    - messages/en/profile.json
    - messages/th/profile.json
    - messages/mm/profile.json
    - .planning/supabase-schema.sql
decisions:
  - Tier detection from dailyLimitSatang value matching — fallback to premium if no match
  - PATCH validation happens before auth check in demo mode to give correct 400 on bad input regardless of mode
  - selectedTier initialized from currentTier derived at render time; Save is disabled when unchanged
metrics:
  duration: 286s
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_changed: 7
---

# Phase 17 Plan 02: Spending Limits — Summary

**One-liner:** User-configurable spending limits with Basic/Standard/Premium tier selector, GET/PATCH API using Zod validation, SWR hook, and profile menu integration across all three locales.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create spending limits API route and SWR hook | b0055e2 | route.ts, use-spending-limits.ts, supabase-schema.sql |
| 2 | Create spending limits page and update profile menu | bf558b9 | spending-limits/page.tsx, profile/page.tsx, 3x locale JSON |

## What Was Built

### API Route (`/api/spending-limits`)
- **GET**: Returns `{ daily_limit_satang, monthly_limit_satang }`. Demo mode returns premium defaults (5,000,000 / 20,000,000 satang). Auth mode queries `user_profiles` with fallback defaults.
- **PATCH**: Accepts `{ tier: 'basic' | 'standard' | 'premium' }`, validates with Zod before auth check. Demo mode returns `{ success: true }`. Auth mode updates `user_profiles`.
- **Tier constants**: Basic (10k/50k THB), Standard (30k/100k THB), Premium (50k/200k THB).

### SWR Hook (`useSpendingLimits`)
- Fetches from `/api/spending-limits` with SWR caching.
- Returns `dailyLimitSatang`, `monthlyLimitSatang`, `isLoading`, `error`, `mutate`.
- Defaults to premium values (5,000,000 / 20,000,000) while loading or on error.

### Spending Limits Page (`/profile/spending-limits`)
- BackHeader with i18n title.
- Current limits display showing live values formatted via `formatCurrency`.
- Three tier cards with blue border/background when selected and radio circle indicator.
- Save button disabled when selected tier matches current tier or while saving.
- Calls PATCH API on save, invalidates SWR cache, shows toast on success/failure.

### Profile Menu Update
- Settings section "Manage Personal Limitation" now navigates to `/profile/spending-limits`.
- Help & Support "Limits and Fees" continues navigating to `/profile/limits-fees` (static regulatory info — different concept).

### i18n
- Added `spendingLimits` namespace to `en`, `th`, `mm` profile locale files.
- All UI strings: title, description, limit labels, tier names, per-day/month suffixes, save/saved/saveFailed.

### Schema Migration
- Appended Phase 17 migration to `.planning/supabase-schema.sql`:
  ```sql
  ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS daily_limit_satang bigint DEFAULT 5000000,
    ADD COLUMN IF NOT EXISTS monthly_limit_satang bigint DEFAULT 20000000;
  ```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — spending limits page wires live data from SWR hook. Demo mode returns real tier defaults.

## Self-Check: PASSED
