# Roadmap: 2C2P Wave

## Overview

This roadmap builds a mobile-first PWA for cross-border money transfers (THB→MMK) across 7 phases. The project scaffold already exists with 16 routes compiling — work starts from hardening the foundation (design system, DB schema, mock services, i18n) through authentication, eKYC onboarding, the home dashboard, the core transfer and recipient flow, wallet operations, and finally profile/settings/card polish. Every phase delivers a coherent, verifiable capability that can be demoed independently.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Design system, DB schema, mock services, and i18n are production-ready
- [ ] **Phase 2: Authentication** - Users can register, verify OTP, set passcode, and stay logged in
- [ ] **Phase 3: eKYC Onboarding** - Users can complete identity verification with mock approval/rejection
- [ ] **Phase 4: Home & Wallet** - Users can view their balance, recent transactions, and navigate the app
- [ ] **Phase 5: Transfer & Recipients** - Users can send money to Myanmar with full confirmation flow
- [ ] **Phase 6: Wallet Operations** - Users can top up, withdraw, scan QR, and review transaction history
- [ ] **Phase 7: Profile, Card & System States** - Users can manage settings, view virtual card, and see system state screens

## Phase Details

### Phase 1: Foundation
**Goal**: The app shell, design tokens, Supabase schema, mock API services, and i18n infrastructure are all in place — every downstream phase builds on a stable, branded base
**Depends on**: Nothing (first phase — scaffold already exists)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, FOUN-08
**Success Criteria** (what must be TRUE):
  1. App renders correctly in a 375-430px viewport with iOS safe area insets respected at top and bottom
  2. All shadcn/ui components display in the yellow (#FFE600) and blue (#0091EA) brand palette with WCAG AA contrast
  3. The Supabase schema (users, wallets, transactions, recipients, kyc_submissions) is deployed with RLS policies enabled and rejecting unauthorized reads
  4. Mock eKYC and payment API routes return configurable pass/fail/delay responses driven by environment variables
  5. Language switcher cycles through English, Thai, and Myanmar (Burmese) with Noto Sans Myanmar UI loading correctly for the MM locale
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Design tokens, fonts, layout shell, bottom-nav accessibility, badge variants
- [ ] 01-02-PLAN.md — i18n infrastructure (next-intl v4, message files, proxy.ts composition, locale-aware layout)
- [ ] 01-03-PLAN.md — Mock services env-var wiring, currency utility module with integer arithmetic
- [x] 01-04-PLAN.md — Supabase schema fix (numeric to bigint, missing RLS policies)

**UI hint**: yes

### Phase 2: Authentication
**Goal**: Users can create an account, verify their phone number via OTP, set a passcode, and maintain a persistent session across browser refreshes
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. User can enter a phone number with +66 (TH) or +95 (MM) country code selector and proceed to OTP entry
  2. User can enter a 6-digit OTP and is redirected to registration on first login (existing session restored on repeat visits)
  3. User who partially completed registration can close the browser, reopen, and resume exactly where they left off
  4. User can set a 6-digit passcode at the end of registration and use it for subsequent logins
  5. Unauthenticated users visiting protected routes are redirected to login via proxy.ts
**Plans**: TBD
**UI hint**: yes

### Phase 3: eKYC Onboarding
**Goal**: Users can submit identity documents and selfie through the mock verification flow, see their KYC status, and re-submit after rejection
**Depends on**: Phase 2
**Requirements**: EKYC-01, EKYC-02, EKYC-03, EKYC-04, EKYC-05, EKYC-06, EKYC-07, EKYC-08
**Success Criteria** (what must be TRUE):
  1. User can select a document type (ID card, work permit, pink card, OWIC, visa) and photograph front and back with a camera guide overlay
  2. Camera capture falls back to file picker on iOS PWA standalone mode without any error
  3. User can complete face verification using the circular liveness frame and receive a mock approval or rejection with reasons
  4. KYC status page correctly shows pending, approved, rejected, or expired states with clear next-step instructions
  5. Rejected user can return to submission, see which specific fields failed, correct them, and resubmit
**Plans**: TBD
**UI hint**: yes

### Phase 4: Home & Wallet
**Goal**: Authenticated, KYC-approved users can see their wallet balance, recent transactions, quick actions, and navigate the app through the bottom tab bar
**Depends on**: Phase 3
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06
**Success Criteria** (what must be TRUE):
  1. Dashboard shows the user's name, wallet balance with show/hide toggle, and wallet ID on load
  2. Quick actions grid is tappable and routes to Bills (placeholder), Referral, Withdrawal, and History
  3. Recent History section lists up to 5 transactions with type icon, amount, date, and status badge
  4. Promotions carousel is horizontally scrollable with at least one banner card rendered
  5. Bottom navigation shows 4 tabs (Home, Scan, Add Money, Profile) with a yellow FAB for Add Money; wallet balance updates without a full page reload after a transaction
**Plans**: TBD
**UI hint**: yes

### Phase 5: Transfer & Recipients
**Goal**: Users can select or create a recipient, enter an amount in THB with live MMK conversion, choose a receiving channel, confirm with passcode, and receive a receipt
**Depends on**: Phase 4
**Requirements**: XFER-01, XFER-02, XFER-03, XFER-04, XFER-05, XFER-06, XFER-07, XFER-08, XFER-09, RCPT-01, RCPT-02, RCPT-03, RCPT-04, RCPT-05
**Success Criteria** (what must be TRUE):
  1. Recipient list shows favorites first, then recents, supports search, and allows adding a new recipient with all AML/EDD fields (NRC, occupation, purpose, relationship)
  2. Amount entry screen displays real-time MMK conversion and a rate lock timer countdown visible at confirmation
  3. User can select from four receiving channels (Wave Agent, Wave App, Bank Transfer, Cash Pickup) with per-channel fee breakdown shown before selection
  4. Confirmation screen summarizes amount, converted amount, exchange rate, fees, and total; user confirms with passcode
  5. Transfer receipt with reference number, amounts, rate, and timestamp is displayed after a successful mock submission; status progresses from pending through processing to completed
**Plans**: TBD
**UI hint**: yes

### Phase 6: Wallet Operations
**Goal**: Users can add money via bank or convenience store QR, withdraw to a recipient, scan QR codes, and review their full transaction history with filters
**Depends on**: Phase 5
**Requirements**: ADDM-01, ADDM-02, ADDM-03, ADDM-04, ADDM-05, HIST-01, HIST-02, HIST-03, HIST-04, HIST-05, SCAN-01, SCAN-02, WTHD-01, WTHD-02, WTHD-03
**Success Criteria** (what must be TRUE):
  1. User can enter a top-up amount, select a bank or convenience store channel, and see a QR code with payment details and an expiration countdown
  2. Withdrawal flow lets user select a recipient, enter an amount (validated against balance), and confirm with passcode
  3. QR scanner page displays a camera view with scan frame overlay; falls back to file picker on iOS PWA standalone mode
  4. Transaction history displays an infinite-scrollable chronological list with date-range picker (handling Thai Buddhist calendar years) and type/status filters
  5. Transaction detail view shows full receipt breakdown matching the transfer receipt format
**Plans**: TBD
**UI hint**: yes

### Phase 7: Profile, Card & System States
**Goal**: Users can manage account settings, view and interact with their virtual Visa card, switch language, share their referral, and the app handles maintenance, update, and error states gracefully
**Depends on**: Phase 6
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06, PROF-07, PROF-08, CARD-01, CARD-02, CARD-03, SYST-01, SYST-02, SYST-03, SYST-04, SYST-05
**Success Criteria** (what must be TRUE):
  1. Profile menu matches the prototype layout and links to all sub-pages (phone change, passcode change, limits & fees, terms, privacy, FAQ, contact us)
  2. User can change phone number through multi-step OTP verification and change passcode via current→new flow
  3. Language switcher (EN/TH/MM) on the profile page updates the entire UI immediately without a full page reload
  4. Virtual Visa card displays masked number, holder name, and expiry; user can reveal/hide card details and freeze/unfreeze the card
  5. Maintenance screen, update-required screen, profile-rejected screen, loading skeletons, and error boundary messages all render correctly under their respective trigger conditions
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/4 | Planning complete | - |
| 2. Authentication | 0/TBD | Not started | - |
| 3. eKYC Onboarding | 0/TBD | Not started | - |
| 4. Home & Wallet | 0/TBD | Not started | - |
| 5. Transfer & Recipients | 0/TBD | Not started | - |
| 6. Wallet Operations | 0/TBD | Not started | - |
| 7. Profile, Card & System States | 0/TBD | Not started | - |
