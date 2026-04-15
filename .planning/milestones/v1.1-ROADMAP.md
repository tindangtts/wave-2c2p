# Roadmap: 2C2P Wave

## Milestones

- ✅ **v1.0 MVP** — Phases 1-8 (shipped 2026-04-15) → [Archive](milestones/v1.0-ROADMAP.md)
- 🔄 **v1.1 Feature Completeness** — Phases 9-13 (active)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-8) — SHIPPED 2026-04-15</summary>

- [x] Phase 1: Foundation (4/4 plans) — completed 2026-04-14
- [x] Phase 2: Authentication (4/4 plans) — completed 2026-04-14
- [x] Phase 3: eKYC Onboarding (4/4 plans) — completed 2026-04-14
- [x] Phase 4: Home & Wallet (2/2 plans) — completed 2026-04-14
- [x] Phase 5: Transfer & Recipients (4/4 plans) — completed 2026-04-14
- [x] Phase 6: Wallet Operations (4/4 plans) — completed 2026-04-14
- [x] Phase 7: Profile, Card & System States (4/4 plans) — completed 2026-04-14
- [x] Phase 8: Integration Fixes (1/1 plan) — completed 2026-04-15

</details>

### v1.1 Feature Completeness

- [x] **Phase 9: Compliance & Registration** - T&C consent, pre-registration info, daily limit acknowledgment, selfie/liveness capture (completed 2026-04-15)
- [x] **Phase 10: Transfer Enhancements** - P2P wallet transfer, cash pick-up channel, e-receipt share, recipient favourites (completed 2026-04-15)
- [x] **Phase 11: Wallet Operations** - 123 Service top-up, bank account CRUD, Myanmar address cascade (completed 2026-04-15)
- [x] **Phase 12: Complex Flows** - Visa card request + payment, work permit document update (completed 2026-04-15)
- [x] **Phase 13: Engagement & Auth** - Referral stats + social share, notification inbox, biometric login (completed 2026-04-15)

## Phase Details

### Phase 9: Compliance & Registration
**Goal**: New users pass through all legally required consent and acknowledgment screens before completing registration
**Depends on**: Phase 8 (v1.0 registration flow)
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. A new user sees the pre-registration info screen explaining required documents before the registration form begins
  2. A new user must actively tick T&C and Privacy Policy checkboxes (no pre-ticked boxes) before advancing; consent is recorded with timestamp and version
  3. A new user sees the daily transfer limit acknowledgment screen and must confirm before proceeding
  4. During eKYC, a user completes selfie capture inside a circular face guide overlay without triggering iOS camera re-prompt between document capture and selfie steps
**Plans**: 3 plans

Plans:
- [x] 09-01-PLAN.md — Store extension + i18n strings + consent API route
- [x] 09-02-PLAN.md — Pre-reg info screen + T&C consent screen + OTP routing update
- [x] 09-03-PLAN.md — Daily limit acknowledgment screen + CameraOverlay face guide

**UI hint**: yes

### Phase 10: Transfer Enhancements
**Goal**: Users can transfer money to any wallet peer-to-peer, pick up cash with a secret code, share receipts with family, and quickly reach saved favourite recipients
**Depends on**: Phase 9
**Requirements**: P2P-01, P2P-02, P2P-03, P2P-04, CHAN-01, CHAN-02, CHAN-03, HIST-01, HIST-02, REC-01, REC-02, REC-03
**Success Criteria** (what must be TRUE):
  1. User can initiate a P2P transfer by entering a wallet ID or scanning a wallet QR code, see a confirmation screen with sender/receiver details and fees, and receive a receipt after completion
  2. User can select cash pick-up as a transfer channel; after a successful transfer the receipt displays a server-generated secret code that can be copied or refreshed
  3. User can export any transaction receipt as a PNG image via the native share sheet or download it directly to their device
  4. User can star/unstar a recipient and filter the recipient list to show only favourites; starred recipients appear at the top of all recipient lists
**Plans**: 5 plans

Plans:
- [x] 10-01-PLAN.md — P2P store + P2P transfer API + secret code refresh API + recipients PATCH
- [x] 10-02-PLAN.md — P2P wallet ID entry screen + P2P amount entry screen
- [x] 10-03-PLAN.md — Transfer confirm P2P extension + TransferReceipt secret code chip
- [x] 10-04-PLAN.md — Recipient list filter tabs (All / Favourites)
- [x] 10-05-PLAN.md — PNG receipt export + upgraded share + scan page P2P detection

**UI hint**: yes

### Phase 11: Wallet Operations
**Goal**: Users can top up their wallet at any 123 Service convenience store, manage multiple saved bank accounts for withdrawals, and enter Myanmar addresses with correct administrative hierarchy
**Depends on**: Phase 10
**Requirements**: TOPUP-01, TOPUP-02, BANK-01, BANK-02, BANK-03, BANK-04, REC-04
**Success Criteria** (what must be TRUE):
  1. User can select 123 Service as a top-up channel and sees a Code 128 barcode with Ref.1, Ref.2, amount, and pay-before timestamp that can be scanned at a physical store terminal
  2. User can add a bank account (bank name, account number, account name) and select it during the withdrawal flow; a bank account with a pending withdrawal cannot be deleted
  3. User can delete a bank account via a confirmation dialog; the system blocks deletion if a pending withdrawal references that account
  4. User can enter a Myanmar address using cascading pickers that progress State → Township → Ward/Village
**Plans**: 4 plans

Plans:
- [x] 11-01-PLAN.md — 123 Service barcode page + extend topup API + i18n strings
- [x] 11-02-PLAN.md — bank_accounts DB schema + API routes (GET/POST/DELETE) + BankAccount type
- [x] 11-03-PLAN.md — Withdraw flow bank selector + add-bank form + withdraw API update
- [x] 11-04-PLAN.md — Myanmar address data + cascade picker component + recipient form integration

**UI hint**: yes

### Phase 12: Complex Flows
**Goal**: Users can request a physical Visa card with delivery address selection and FX preview, and existing users can update their work permit via a standalone second-document verification flow
**Depends on**: Phase 11
**Requirements**: VISA-01, VISA-02, VISA-03, VISA-04, COMP-05
**Success Criteria** (what must be TRUE):
  1. User can initiate a Visa card request, choose between current or mailing delivery address, and see FX conversion details on the payment confirmation screen
  2. User sees a success or failure modal after the card payment attempt completes
  3. A user whose work permit has expired can navigate to a standalone document update flow, capture front and back of the new permit, and submit for re-verification without losing access to in-flight transfers
**Plans**: 4 plans

Plans:
- [x] 12-01-PLAN.md — Visa card mock payment API + i18n strings (en/th/mm)
- [x] 12-02-PLAN.md — Work permit update mock KYC API + i18n strings (en/th/mm)
- [x] 12-03-PLAN.md — Visa card request UI (address selection + confirm + result modals)
- [x] 12-04-PLAN.md — Work permit update capture page + profile menu entry

**UI hint**: yes

### Phase 13: Engagement & Auth
**Goal**: Users stay informed through an in-app notification inbox, share referral rewards via social channels, and can authenticate with device biometrics instead of typing a passcode
**Depends on**: Phase 12
**Requirements**: REF-01, REF-02, NOTIF-01, NOTIF-02, NOTIF-03, AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. User can view referral stats (count of referred friends, total bonus earned) and share their referral link via WhatsApp, Line, or copy-to-clipboard
  2. User can open a notification inbox from the home screen bell icon; unread notifications display a badge count; user can mark individual or all notifications as read
  3. User can enrol a biometric credential (Face ID / Touch ID / Fingerprint) from profile settings and subsequently authenticate at login using only biometrics, with automatic fallback to passcode if biometrics fail or are unavailable
**Plans**: 4 plans

Plans:
- [x] 13-01-PLAN.md — Referral stats API + social share buttons (WhatsApp/Line/copy) on refer-friends page
- [x] 13-02-PLAN.md — Notifications API (GET/PATCH) + Notification type + i18n strings
- [x] 13-03-PLAN.md — Notification inbox page + TopHeader bell badge + navigation
- [x] 13-04-PLAN.md — WebAuthn API routes + profile biometrics toggle + passcode biometric button

**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 4/4 | Complete | 2026-04-14 |
| 2. Authentication | v1.0 | 4/4 | Complete | 2026-04-14 |
| 3. eKYC Onboarding | v1.0 | 4/4 | Complete | 2026-04-14 |
| 4. Home & Wallet | v1.0 | 2/2 | Complete | 2026-04-14 |
| 5. Transfer & Recipients | v1.0 | 4/4 | Complete | 2026-04-14 |
| 6. Wallet Operations | v1.0 | 4/4 | Complete | 2026-04-14 |
| 7. Profile, Card & System States | v1.0 | 4/4 | Complete | 2026-04-14 |
| 8. Integration Fixes | v1.0 | 1/1 | Complete | 2026-04-15 |
| 9. Compliance & Registration | v1.1 | 3/3 | Complete   | 2026-04-15 |
| 10. Transfer Enhancements | v1.1 | 5/5 | Complete    | 2026-04-15 |
| 11. Wallet Operations | v1.1 | 4/4 | Complete    | 2026-04-15 |
| 12. Complex Flows | v1.1 | 4/4 | Complete    | 2026-04-15 |
| 13. Engagement & Auth | v1.1 | 4/4 | Complete    | 2026-04-15 |
