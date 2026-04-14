# Requirements: 2C2P Wave

**Defined:** 2026-04-14
**Core Value:** Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: App renders in mobile-first container (max 430px) with safe area handling
- [x] **FOUN-02**: Design system tokens (colors, typography, spacing, shadows) match prototype brand identity
- [x] **FOUN-03**: shadcn/ui components themed with 2C2P Wave yellow/blue palette
- [x] **FOUN-04**: Supabase database schema deployed with RLS enabled on all tables
- [x] **FOUN-05**: i18n infrastructure supports English, Thai, and Myanmar with correct font loading (Noto Sans Myanmar UI)
- [x] **FOUN-06**: Mock eKYC API endpoints respond with configurable pass/fail behavior via env vars
- [x] **FOUN-07**: Mock payment API endpoints provide exchange rates, fee calculation, and transfer processing
- [x] **FOUN-08**: Currency calculations use integer arithmetic (satang/pya) to avoid floating-point errors

### Authentication

- [x] **AUTH-01**: User can enter phone number with country code selector (+66 TH, +95 MM)
- [x] **AUTH-02**: User receives 6-digit OTP and can verify within time limit
- [x] **AUTH-03**: User can complete multi-step registration (personal info, ID details)
- [x] **AUTH-04**: Registration progress is checkpointed server-side so returning users resume where they left off
- [x] **AUTH-05**: User can set up 6-digit passcode for quick login
- [x] **AUTH-06**: Authenticated routes redirect unauthenticated users to login via proxy.ts
- [x] **AUTH-07**: User session persists across browser refresh with automatic token refresh

### eKYC

- [ ] **EKYC-01**: User can select document type (ID card, work permit, pink card, OWIC, visa)
- [ ] **EKYC-02**: User can capture document front/back via camera with guide overlay frame
- [ ] **EKYC-03**: Camera capture falls back to file input on iOS PWA standalone mode
- [ ] **EKYC-04**: User can complete face verification with circular liveness frame
- [ ] **EKYC-05**: Mock eKYC processes documents and returns configurable approval/rejection with reasons
- [ ] **EKYC-06**: User sees KYC status (pending/approved/rejected/expired) with clear next steps
- [ ] **EKYC-07**: User can re-submit documents after rejection with specific field guidance
- [ ] **EKYC-08**: KYC expired modal prompts user to update with consequences explained

### Home & Wallet

- [ ] **HOME-01**: Dashboard displays user name, wallet balance with show/hide toggle, wallet ID
- [ ] **HOME-02**: Quick actions grid shows Bills, Referral, Withdrawal, History with correct icons
- [ ] **HOME-03**: Recent History section shows last 5 transactions with status badges
- [ ] **HOME-04**: Promotion carousel displays scrollable banner cards
- [ ] **HOME-05**: Bottom navigation renders 4 tabs (Home, Scan, Add Money, Profile) with yellow FAB for Add Money
- [ ] **HOME-06**: Wallet balance updates in real-time after transactions via Supabase Realtime

### Transfer & Remittance

- [ ] **XFER-01**: User can select existing recipient or add new one
- [ ] **XFER-02**: User can enter amount in THB with real-time MMK conversion display
- [ ] **XFER-03**: Exchange rate is displayed with lock timer countdown at confirmation
- [ ] **XFER-04**: User can select receiving channel (Wave Agent, Wave App, Bank Transfer, Cash Pickup)
- [ ] **XFER-05**: Fee breakdown shows per-channel fees before channel selection
- [ ] **XFER-06**: Transfer confirmation shows full summary (amount, converted, rate, fees, total)
- [ ] **XFER-07**: User confirms transfer with passcode entry
- [ ] **XFER-08**: Transfer status updates from pending → processing → completed/failed
- [ ] **XFER-09**: User receives receipt with reference number, amounts, rate, and timestamp

### Recipient Management

- [ ] **RCPT-01**: User can add recipient with name, phone (+95), and country
- [ ] **RCPT-02**: User can provide NRC, occupation, transfer purpose, relationship (AML/EDD compliance fields)
- [ ] **RCPT-03**: User can edit and delete existing recipients
- [ ] **RCPT-04**: User can mark recipients as favorites for quick access
- [ ] **RCPT-05**: Recipient list shows favorites first, then recents, with search

### Add Money

- [ ] **ADDM-01**: User can enter top-up amount with balance and max limit displayed
- [ ] **ADDM-02**: User can select bank/convenience store channel from grid
- [ ] **ADDM-03**: QR code generates for selected amount with payment details
- [ ] **ADDM-04**: QR display shows countdown timer for expiration
- [ ] **ADDM-05**: Payment confirmation/receipt displays after successful top-up

### Transaction History

- [ ] **HIST-01**: User can view chronological transaction list with infinite scroll
- [ ] **HIST-02**: User can filter by date range using calendar picker
- [ ] **HIST-03**: User can filter by transaction type and status
- [ ] **HIST-04**: User can view transaction detail/receipt with full breakdown
- [ ] **HIST-05**: Date picker handles Thai Buddhist calendar year correctly

### Profile & Settings

- [ ] **PROF-01**: Profile page shows settings menu matching prototype layout
- [ ] **PROF-02**: User can change phone number through multi-step verification
- [ ] **PROF-03**: User can change passcode (current → new flow)
- [ ] **PROF-04**: User can switch language (EN/TH/MM) with immediate UI update
- [ ] **PROF-05**: User can view and share referral QR code with monthly count
- [ ] **PROF-06**: Contact Us page shows call center, social channels, and resources
- [ ] **PROF-07**: User can view Limits & Fees, Terms, Privacy Policy, and FAQ pages
- [ ] **PROF-08**: User can log out from profile page

### System States

- [ ] **SYST-01**: Maintenance mode screen displays when server is unavailable
- [ ] **SYST-02**: App update required screen displays when version is outdated
- [ ] **SYST-03**: Profile/registration rejected screens display with specific reasons
- [ ] **SYST-04**: Loading skeletons display during data fetching on all list screens
- [ ] **SYST-05**: Error boundaries catch and display user-friendly error messages

### Withdrawal

- [ ] **WTHD-01**: User can select recipient for withdrawal
- [ ] **WTHD-02**: User can enter withdrawal amount with balance validation
- [ ] **WTHD-03**: User can confirm withdrawal with passcode

### Card & Scan

- [ ] **CARD-01**: Virtual Visa card displays with masked number, holder name, expiry
- [ ] **CARD-02**: User can reveal/hide card details (number, CVV, expiry)
- [ ] **CARD-03**: User can freeze/unfreeze virtual card
- [ ] **SCAN-01**: QR scanner page displays camera view with scan frame overlay
- [ ] **SCAN-02**: QR scanner falls back to file input on iOS PWA standalone mode

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications
- **NOTF-01**: User receives push notifications for transaction status changes
- **NOTF-02**: User can configure notification preferences per event type

### Bills Payment
- **BILL-01**: User can pay bills through supported billers
- **BILL-02**: User can save frequent billers for quick payment

### Advanced Card
- **CARD-04**: User can order physical card with delivery address
- **CARD-05**: Card balance chart visualization
- **CARD-06**: Card transaction history separate from wallet

### Biometric Auth
- **AUTH-08**: User can enable fingerprint/face unlock as alternative to passcode

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real eKYC vendor integration | Mock service only — real KYC vendor requires contract and compliance review |
| Real payment gateway | Mock service only — real payment processing requires PCI compliance |
| Real SMS/OTP delivery | Mock flow with auto-bypass for development |
| Native mobile app | PWA only — wider reach, single codebase |
| Admin dashboard | User-facing app only for v1 |
| Real-time chat support | Static contact info only — chat requires support team infrastructure |
| Multi-currency wallets | THB only for v1 — MMK is conversion target, not stored balance |
| WebAuthn / passkeys | PWA support inconsistent across iOS versions |
| Zawgyi auto-detection | Complex encoding detection deferred — Unicode-only for v1, with font self-hosting |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| FOUN-07 | Phase 1 | Complete |
| FOUN-08 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| AUTH-05 | Phase 2 | Complete |
| AUTH-06 | Phase 2 | Complete |
| AUTH-07 | Phase 2 | Complete |
| EKYC-01 | Phase 3 | Pending |
| EKYC-02 | Phase 3 | Pending |
| EKYC-03 | Phase 3 | Pending |
| EKYC-04 | Phase 3 | Pending |
| EKYC-05 | Phase 3 | Pending |
| EKYC-06 | Phase 3 | Pending |
| EKYC-07 | Phase 3 | Pending |
| EKYC-08 | Phase 3 | Pending |
| HOME-01 | Phase 4 | Pending |
| HOME-02 | Phase 4 | Pending |
| HOME-03 | Phase 4 | Pending |
| HOME-04 | Phase 4 | Pending |
| HOME-05 | Phase 4 | Pending |
| HOME-06 | Phase 4 | Pending |
| XFER-01 | Phase 5 | Pending |
| XFER-02 | Phase 5 | Pending |
| XFER-03 | Phase 5 | Pending |
| XFER-04 | Phase 5 | Pending |
| XFER-05 | Phase 5 | Pending |
| XFER-06 | Phase 5 | Pending |
| XFER-07 | Phase 5 | Pending |
| XFER-08 | Phase 5 | Pending |
| XFER-09 | Phase 5 | Pending |
| RCPT-01 | Phase 5 | Pending |
| RCPT-02 | Phase 5 | Pending |
| RCPT-03 | Phase 5 | Pending |
| RCPT-04 | Phase 5 | Pending |
| RCPT-05 | Phase 5 | Pending |
| ADDM-01 | Phase 6 | Pending |
| ADDM-02 | Phase 6 | Pending |
| ADDM-03 | Phase 6 | Pending |
| ADDM-04 | Phase 6 | Pending |
| ADDM-05 | Phase 6 | Pending |
| HIST-01 | Phase 6 | Pending |
| HIST-02 | Phase 6 | Pending |
| HIST-03 | Phase 6 | Pending |
| HIST-04 | Phase 6 | Pending |
| HIST-05 | Phase 6 | Pending |
| SCAN-01 | Phase 6 | Pending |
| SCAN-02 | Phase 6 | Pending |
| WTHD-01 | Phase 6 | Pending |
| WTHD-02 | Phase 6 | Pending |
| WTHD-03 | Phase 6 | Pending |
| PROF-01 | Phase 7 | Pending |
| PROF-02 | Phase 7 | Pending |
| PROF-03 | Phase 7 | Pending |
| PROF-04 | Phase 7 | Pending |
| PROF-05 | Phase 7 | Pending |
| PROF-06 | Phase 7 | Pending |
| PROF-07 | Phase 7 | Pending |
| PROF-08 | Phase 7 | Pending |
| CARD-01 | Phase 7 | Pending |
| CARD-02 | Phase 7 | Pending |
| CARD-03 | Phase 7 | Pending |
| SYST-01 | Phase 7 | Pending |
| SYST-02 | Phase 7 | Pending |
| SYST-03 | Phase 7 | Pending |
| SYST-04 | Phase 7 | Pending |
| SYST-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 63 total
- Mapped to phases: 63
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 after initial definition*
