---
phase: 13-engagement-auth
plan: 01
subsystem: ui
tags: [referral, swr, social-share, whatsapp, line, i18n]

# Dependency graph
requires:
  - phase: 07-profile-card-system-states
    provides: profile page and referral card component
provides:
  - GET /api/referral/stats returning referredCount, totalBonusSatang, referralCode
  - Refer-friends page with live stats display and social share buttons
affects: [profile, referral, engagement]

# Tech tracking
tech-stack:
  added: []
  patterns: [SWR fetch for referral stats, navigator.share primary + WhatsApp/Line/Copy fallback row]

key-files:
  created:
    - src/app/api/referral/stats/route.ts
  modified:
    - src/app/(main)/profile/refer-friends/page.tsx
    - messages/en/profile.json
    - messages/th/profile.json
    - messages/mm/profile.json

key-decisions:
  - "Demo mode returns 3 referred friends and 30000 satang (300 THB) mock bonus"
  - "referral_code column fallback to WAVE2C2P when user_profiles column missing"
  - "navigator.share() as primary CTA; WhatsApp/Line/Copy as explicit secondary row"

patterns-established:
  - "Pattern: Social share row uses flex gap-3 with flex-1 buttons for WhatsApp (green #25D366), Line (green #06C755), Copy (yellow #FFE600)"
  - "Pattern: Stats grid uses grid grid-cols-2 gap-3 with bg-white rounded-xl shadow-sm cards"

requirements-completed: [REF-01, REF-02]

# Metrics
duration: 10min
completed: 2026-04-15
---

# Phase 13 Plan 01: Referral Stats Summary

**Referral stats API (/api/referral/stats) + refer-friends page with 2-card stats display and WhatsApp/Line/Copy social share buttons wired to live data**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-15T00:00:00Z
- **Completed:** 2026-04-15T05:18:30Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- GET /api/referral/stats with demo mode (3 referrals, 300 THB bonus) and real Supabase query
- Refer-friends page upgraded with 2-card stats grid (referred count + total bonus) fetched via useSWR
- WhatsApp, Line, and copy-link share buttons added alongside existing navigator.share() primary button
- All 3 locale files (en, th, mm) updated with referredCount, totalBonus, bonusValue, shareWhatsApp, shareLine, copyLink, linkCopied keys

## Task Commits

1. **Task 1: Referral stats API route** - `65b290f` (feat)
2. **Task 2: Referral stats UI + social share buttons + i18n** - `4ad4eb3` (feat)

## Files Created/Modified
- `src/app/api/referral/stats/route.ts` - GET handler returning referredCount, totalBonusSatang, referralCode; demo mode + real Supabase query
- `src/app/(main)/profile/refer-friends/page.tsx` - Updated with useSWR stats fetch, stats card grid, WhatsApp/Line/Copy buttons
- `messages/en/profile.json` - Added referredCount, totalBonus, bonusValue, shareWhatsApp, shareLine, copyLink, linkCopied keys
- `messages/th/profile.json` - Thai translations for new referFriends keys
- `messages/mm/profile.json` - Burmese translations for new referFriends keys

## Decisions Made
- Demo mode returns hardcoded 3 referrals and 30000 satang (300 THB) for a realistic preview
- Real mode queries referrals table filtering status === 'completed' for count and bonus sum
- referral_code column falls back to 'WAVE2C2P' mock if column missing in user_profiles
- navigator.share() retained as primary mobile share CTA; social buttons are explicit secondary actions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- REF-01 and REF-02 requirements satisfied
- Referral stats endpoint ready for Phase 13 plan 02 engagement features
- Social share flow complete with all three locales

---
*Phase: 13-engagement-auth*
*Completed: 2026-04-15*
