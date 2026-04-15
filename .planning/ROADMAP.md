# Roadmap: 2C2P Wave

## Milestones

- ✅ **v1.0 MVP** — Phases 1-8 (shipped 2026-04-15) → [Archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Feature Completeness** — Phases 9-13 (shipped 2026-04-15)
- ✅ **v1.2 Production Readiness** — Phases 14-17 (shipped 2026-04-15)
- 🔄 **v1.3 Supabase Migration & Auth Hardening** — Phases 18-22 (in progress)

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

<details>
<summary>✅ v1.1 Feature Completeness (Phases 9-13) — SHIPPED 2026-04-15</summary>

- [x] Phase 9: Compliance & Registration (3/3 plans) — completed 2026-04-15
- [x] Phase 10: Transfer Enhancements (5/5 plans) — completed 2026-04-15
- [x] Phase 11: Wallet Operations (4/4 plans) — completed 2026-04-15
- [x] Phase 12: Complex Flows (4/4 plans) — completed 2026-04-15
- [x] Phase 13: Engagement & Auth (4/4 plans) — completed 2026-04-15

</details>

<details>
<summary>✅ v1.2 Production Readiness (Phases 14-17) — SHIPPED 2026-04-15</summary>

- [x] Phase 14: PWA & Offline (2/2 plans) — completed 2026-04-15
- [x] Phase 15: QR Scanner & WebAuthn Migration (3/3 plans) — completed 2026-04-15
- [x] Phase 16: Test Coverage (5/5 plans) — completed 2026-04-15
- [x] Phase 17: Features & Polish (2/2 plans) — completed 2026-04-15

</details>

### v1.3 Supabase Migration & Auth Hardening

- [x] **Phase 18: Core Data Layer** - Wire wallet, transactions, and Visa card reads to Supabase tables (completed 2026-04-15)
- [ ] **Phase 19: Payment Write-Back** - Mock payment APIs insert real transactions and update wallet balance in DB
- [ ] **Phase 20: New Tables & Seed** - Notifications and vouchers tables, plus a seed SQL file for fresh installs
- [ ] **Phase 21: System Config & Auth Gates** - SystemConfig table, maintenance/version checks, rejected-number gate, single active session
- [ ] **Phase 22: Demo Mode Removal** - Delete demo.ts and remove all isDemoMode branches from the codebase

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

### Phase 14: PWA & Offline
**Goal**: The app is installable as a PWA and remains functional on spotty or no connectivity through a service worker caching strategy
**Depends on**: Phase 13
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05
**Success Criteria** (what must be TRUE):
  1. A mobile user visiting the app on Chrome or Safari sees an install-to-home-screen prompt and can install the app; the installed app opens with the correct splash screen and icons
  2. A user who installed the app and goes offline can still open the app and see the home screen (app shell loads from cache)
  3. A user on a slow connection attempting an API call while offline sees a clear offline fallback message instead of a broken page
  4. Static assets (icons, fonts) load instantly on repeat visits because they are served from cache (CacheFirst), and API routes always attempt the network first (NetworkFirst)
**Plans**: 2 plans

Plans:
- [x] 14-01-PLAN.md — Install Serwist, configure next.config.ts plugin, create service worker entry with caching strategies
- [x] 14-02-PLAN.md — Web app manifest (icons, splash, display, theme), offline fallback page, install prompt component

### Phase 15: QR Scanner & WebAuthn Migration
**Goal**: The QR scanner page uses real camera hardware for live scanning, and the biometric auth system is backed by proper database columns in the deployed environment
**Depends on**: Phase 14
**Requirements**: QR-01, QR-02, DB-01, DB-02
**Success Criteria** (what must be TRUE):
  1. User can open the scan page, point their camera at a QR code, and have it detected and decoded without pressing any button
  2. When a scanned QR code contains a wallet ID the app navigates to the P2P transfer flow pre-filled with that wallet ID; when it contains a payment code the app navigates to the receive/add-money flow
  3. A developer running the production migration can apply the WebAuthn columns (credential_id, public_key, counter, challenge) to user_profiles without data loss
  4. A user on a deployed HTTPS domain with an installed PWA can enrol Face ID / Touch ID and subsequently authenticate using biometrics
**Plans**: 3 plans

Plans:
- [x] 15-01-PLAN.md — Install @yudiel/react-qr-scanner, replace mock scan page with live scanner component, iOS playsInline + permission handling
- [x] 15-02-PLAN.md — QR type detection logic (wallet ID vs payment code) + navigation routing + file-input fallback for iOS PWA
- [x] 15-03-PLAN.md — Supabase SQL migration for WebAuthn columns + verify biometric enrollment on HTTPS

### Phase 16: Test Coverage
**Goal**: Critical auth, currency, and transfer code paths are verified by automated tests so regressions are caught before deployment
**Depends on**: Phase 15
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. Running `npm test` executes Vitest unit tests covering Zod schemas (auth, transfer, wallet, KYC) and all tests pass
  2. Running `npm test` also covers currency formatting edge cases — THB zero, MMK large amounts, locale switching — and all pass
  3. Vitest + RTL tests exercise registration, recipient, and amount form components: submit with valid data succeeds, submit with invalid data shows field errors
  4. Running `npm run test:e2e` executes Playwright against localhost:3000 and the registration → KYC happy path completes without errors
  5. Running `npm run test:e2e` also covers the transfer confirmation → receipt happy path end to end
**Plans**: 5 plans

Plans:
- [x] 16-01-PLAN.md — Vitest + RTL setup (vitest.config.ts, jsdom environment, test utilities, mock Supabase client)
- [x] 16-02-PLAN.md — Zod schema unit tests (auth, transfer, wallet, KYC) + currency formatter unit tests
- [x] 16-03-PLAN.md — Form component RTL tests (registration, recipient, amount entry)
- [x] 16-04-PLAN.md — Playwright setup (playwright.config.ts, global setup for auth state) + registration → KYC E2E test
- [x] 16-05-PLAN.md — Transfer confirmation → receipt E2E test

### Phase 17: Features & Polish
**Goal**: Users can download a PDF of their transaction history for any date range, and can view and adjust their personal spending limits from the profile
**Depends on**: Phase 16
**Requirements**: FEAT-01, FEAT-02
**Success Criteria** (what must be TRUE):
  1. User can select a date range on the transaction history screen and tap a download button; the browser downloads or shares a PDF file containing transactions for that range, formatted with amounts in THB and MMK
  2. User can navigate to a spending limits screen in profile settings, see their current daily and monthly limits, and edit them within the allowed tier options; changes persist across sessions
**Plans**: 2 plans

Plans:
- [x] 17-01-PLAN.md — PDF statement download (jsPDF + statement API + download button on history page)
- [x] 17-02-PLAN.md — Spending limits (GET/PATCH API + SWR hook + tier selector page + profile menu update)

**UI hint**: yes

### Phase 18: Core Data Layer
**Goal**: The home screen, transaction history, and Visa card page reflect real user data from Supabase — no hardcoded balances or demo records
**Depends on**: Phase 17
**Requirements**: DATA-01, DATA-02, DATA-06
**Success Criteria** (what must be TRUE):
  1. The home screen wallet balance reflects the value stored in the user's `wallets` row in Supabase, and updating that row via the DB console is reflected on next page load
  2. The transaction history page fetches from the `transactions` table with cursor-based pagination — scrolling past the first page loads older records from the database
  3. The Visa card page displays card number, expiry, and freeze status from the `cards` table; a card with `is_frozen = true` in the DB shows the frozen state without a hardcoded override
**Plans**: 3 plans

Plans:
- [x] 18-01-PLAN.md — Install Drizzle ORM + schema definitions + db singleton + drizzle.config
- [x] 18-02-PLAN.md — Replace wallet + transactions API routes with Drizzle queries
- [x] 18-03-PLAN.md — Create /api/cards route + update card page to fetch from DB

### Phase 19: Payment Write-Back
**Goal**: Every money movement initiated through the app creates a permanent record in Supabase and updates the user's wallet balance atomically
**Depends on**: Phase 18
**Requirements**: DATA-03
**Success Criteria** (what must be TRUE):
  1. After a successful transfer (A/C, P2P, or cash pick-up), a new row appears in the `transactions` table with the correct type, amount, fee, status, and recipient reference
  2. After a top-up completes, the user's `wallets.balance` increases by the deposited amount and the corresponding `add_money` transaction is visible in history
  3. After a withdrawal, the wallet balance decreases by the withdrawn amount and a `withdraw` transaction record is created
  4. If a payment API call fails mid-flight, the wallet balance remains unchanged (no partial writes)
**Plans**: TBD

### Phase 20: New Tables & Seed
**Goal**: Notifications and vouchers are stored in Supabase and can be queried per-user, and a fresh Supabase install has enough seed data to run the app without manual setup
**Depends on**: Phase 18
**Requirements**: DATA-04, DATA-05, DATA-07
**Success Criteria** (what must be TRUE):
  1. The notification inbox fetches rows from the `notifications` table scoped to the logged-in user; marking a notification as read updates `is_read = true` in the DB and the badge count decrements
  2. A voucher code entered by the user is validated against the `vouchers` table; a valid unredeemed code updates `redeemed_at` and credits the wallet; an already-redeemed code returns an error
  3. Running the seed SQL against a blank Supabase project populates wallets, transactions, cards, notifications, and vouchers with enough demo records that all screens render without empty-state fallbacks
**Plans**: TBD

### Phase 21: System Config & Auth Gates
**Goal**: The app enforces maintenance windows and version requirements on every open, blocks permanently rejected users before they can log in, and ensures only one active session exists per user
**Depends on**: Phase 20
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. Setting `maintenance_mode = true` in the `system_config` table causes every app open to show a blocking maintenance modal; clearing the flag allows normal access without a redeploy
  2. Setting `min_version` in `system_config` to a value higher than the current app version forces a hard-update modal that blocks all navigation; a `recommended_version` mismatch shows a dismissible soft-update banner
  3. A user whose `user_profiles` record has `kyc_status = 'permanently_rejected'` (or equivalent flag) sees a rejection modal at the phone-entry step and cannot proceed to OTP
  4. Logging in on a second device invalidates the previous session token; the first device is redirected to the login screen on the next authenticated API call
**Plans**: TBD

### Phase 22: Demo Mode Removal
**Goal**: The codebase contains no DEMO_MODE conditional branches — every API route reads from and writes to Supabase exclusively
**Depends on**: Phase 21
**Requirements**: DATA-08
**Success Criteria** (what must be TRUE):
  1. `src/lib/demo.ts` does not exist in the repository and no file imports it
  2. A full-text search for `isDemoMode` across the codebase returns zero matches
  3. Running `npm run build` with `DEMO_MODE` unset (or set to `false`) completes without type errors or missing-variable warnings
  4. The home screen, transfer flow, and transaction history all operate correctly using only Supabase data after demo code removal
**Plans**: TBD

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
| 9. Compliance & Registration | v1.1 | 3/3 | Complete | 2026-04-15 |
| 10. Transfer Enhancements | v1.1 | 5/5 | Complete | 2026-04-15 |
| 11. Wallet Operations | v1.1 | 4/4 | Complete | 2026-04-15 |
| 12. Complex Flows | v1.1 | 4/4 | Complete | 2026-04-15 |
| 13. Engagement & Auth | v1.1 | 4/4 | Complete | 2026-04-15 |
| 14. PWA & Offline | v1.2 | 2/2 | Complete | 2026-04-15 |
| 15. QR Scanner & WebAuthn Migration | v1.2 | 3/3 | Complete | 2026-04-15 |
| 16. Test Coverage | v1.2 | 5/5 | Complete | 2026-04-15 |
| 17. Features & Polish | v1.2 | 2/2 | Complete | 2026-04-15 |
| 18. Core Data Layer | v1.3 | 3/3 | Complete   | 2026-04-15 |
| 19. Payment Write-Back | v1.3 | 0/TBD | Not started | - |
| 20. New Tables & Seed | v1.3 | 0/TBD | Not started | - |
| 21. System Config & Auth Gates | v1.3 | 0/TBD | Not started | - |
| 22. Demo Mode Removal | v1.3 | 0/TBD | Not started | - |
