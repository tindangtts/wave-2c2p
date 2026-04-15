# Phase 13: Engagement & Auth - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous workflow)

<domain>
## Phase Boundary

Add referral stats display + social sharing (WhatsApp, Line, copy link), notification inbox with unread badge, and biometric login (WebAuthn for Face ID / Touch ID / Fingerprint).

</domain>

<decisions>
## Implementation Decisions

### Referral Stats + Social Share
- Extend existing `/referral/page.tsx` and `/profile/refer-friends/page.tsx` with stats display (referred count, bonus earned)
- Share buttons: WhatsApp (`https://wa.me/?text=`), Line (`https://line.me/R/msg/text/`), copy link, plus `navigator.share()` as primary on mobile
- Mock referral stats API: `/api/referral/stats` returning count + total bonus
- No new libraries needed — URL schemes + Web Share API cover all cases

### Notification Inbox
- New `notifications` table in Supabase (id, user_id, type, title, body, is_read, deep_link, created_at)
- New `/api/notifications` route (GET list, PATCH mark read)
- New page: `/home/notifications/page.tsx` or accessible from home header bell icon
- Unread badge: count from API, displayed on bell icon in TopHeader
- SWR for fetching with 30s deduping

### Biometric Login (WebAuthn)
- Install `@simplewebauthn/browser` + `@simplewebauthn/server` (from research STACK.md)
- Profile settings toggle to enroll biometric credential
- Login screen: if biometric enrolled, show biometric button before passcode
- WebAuthn credentials stored in Supabase `user_profiles` (webauthn_credential_id, webauthn_public_key columns)
- Passcode fallback always available
- Mock mode: biometric enrollment returns success without real WebAuthn ceremony (browser API may not be available in dev)

### Claude's Discretion
All implementation details at Claude's discretion — this is the final phase with well-established patterns.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `refer-friends/page.tsx` — existing referral page with QR code
- `referral/page.tsx` — existing referral entry point
- `referral-card.tsx` — existing referral card component
- `TopHeader` — has bell icon slot for notification badge
- `passcode/page.tsx` — existing login passcode screen
- Profile settings pages — established pattern for toggles

### Integration Points
- TopHeader needs unread notification count badge
- Login page needs biometric button before passcode entry
- Profile page needs biometric toggle in settings

</code_context>

<specifics>
## Specific Ideas

- Pencil "Share With Friend" screen: referral code, WhatsApp/Line/copy buttons
- Pencil "Referral Count" screen: stats display
- PRD Section 5.10: Notification events list
- Research: WebAuthn credentials must go in Supabase, not cookies (ITP expiry)
- Research: biometric only works in installed PWA on iOS (gate with `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()`)

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
