# Phase 7: Profile, Card & System States - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage account settings, view and interact with their virtual Visa card, switch language, share their referral, and the app handles maintenance, update, and error states gracefully. This is the final phase completing all user-facing features.

</domain>

<decisions>
## Implementation Decisions

### Profile Menu & Settings
- D-01: Profile page matches Pencil layout: user avatar + name, Biometrics toggle, Settings section (Information, Refer Friends, Change Passcode, Change Phone Number, Manage Personal Limitation, Notification Settings), Help & Support section (Contact Us, Language, Limits & Fees, Q&A Session, Terms & Conditions, Privacy & Policy), Logout button, version number.
- D-02: Each menu item routes to a sub-page under `/(main)/profile/*`.
- D-03: Logout clears Supabase session + Zustand stores, redirects to login.

### Phone Number Change
- D-04: Multi-step OTP flow: enter new phone → verify via OTP → success. Reuses OTP input component from Phase 2.
- D-05: Mock API: `POST /api/auth/change-phone` sends OTP to new number, `POST /api/auth/verify-change-phone` confirms.

### Passcode Change
- D-06: Current → New flow: enter current passcode → enter new passcode → confirm new passcode → success. Reuses passcode keypad from Phase 2.
- D-07: Validates current passcode via PBKDF2 before allowing new passcode entry.

### Language Switcher
- D-08: Profile page language option shows EN/TH/MM selector. On change, updates cookie locale + triggers full UI re-render via next-intl. No page reload needed.
- D-09: Current language shown as badge next to "Language" menu item.

### Virtual Visa Card
- D-10: Card display: blue/gradient card design with masked card number (•••• •••• •••• 1234), holder name, expiry date. All mock data.
- D-11: Reveal/hide toggle: tap eye icon to show full card number temporarily (auto-hides after 10s).
- D-12: Freeze/unfreeze: toggle switch on card, shows "Card Frozen" overlay when frozen. Mock only — no real card API.

### System State Screens
- D-13: Maintenance screen: AlertDialog modal with "System Under Maintenance" title, "Currently system is under maintenance. We will be back soon." description, single "Ok" button. Triggered by env var `SYSTEM_MAINTENANCE=true`.
- D-14: Update required screen: AlertDialog with "Software Update" title, "A software update is required" description, "Quit"/"Now" buttons. Triggered by env var `SYSTEM_UPDATE_REQUIRED=true`.
- D-15: Error boundary: React error boundary wrapping app, shows friendly error message with "Try Again" button.
- D-16: Loading skeletons: shimmer skeleton components for all major data-loading states (already partially implemented in prior phases).

### Claude's Discretion
- Profile avatar design (use initials on yellow circle, consistent with recipient avatars)
- Notification settings page content (toggle switches for push/email/SMS)
- Information page layout (personal details display)
- Limits & Fees page content
- Terms/Privacy/FAQ page content (placeholder text)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/features/passcode-sheet.tsx` — Passcode input (Phase 5)
- `src/lib/auth/passcode.ts` — PBKDF2 verify/hash utilities (Phase 2)
- OTP input component from Phase 2 auth flow
- `src/components/layout/back-header.tsx` — Standard back navigation header
- Language switching infrastructure from Phase 1 (next-intl, cookie-based locale)

### Integration Points
- Bottom nav "Profile" tab routes to `/profile`
- Maintenance/update modals overlay on any page (app-level check)
- Error boundary wraps the root layout
- Language change affects entire app via next-intl locale cookie

</code_context>

<specifics>
## Specific Ideas

- Profile layout matches Pencil (SQ80R): yellow header, avatar, name, sectioned menu list
- Visa card matches Pencil (XDpyV): blue/gradient card on yellow background, masked number
- System modals match Pencil (Nl1Uy): centered white card, title, description, buttons
- Referral page: share referral code/link via Web Share API (same as receipt share)

</specifics>

<deferred>
## Deferred Ideas

- Real biometrics integration (WebAuthn)
- Real Visa card provisioning
- Push notification setup (service worker)
- Real maintenance/update version checking

</deferred>

---

*Phase: 07-profile-card-system-states*
*Context gathered: 2026-04-14 via Smart Discuss (autonomous)*
