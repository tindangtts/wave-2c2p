# Requirements: 2C2P Wave

**Defined:** 2026-04-15
**Core Value:** Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance

## v1.1 Requirements

Requirements for milestone v1.1 — Feature Completeness. Each maps to roadmap phases.

### Compliance & Registration

- [x] **COMP-01**: User must accept T&C and Privacy Policy before completing registration (consent logged with timestamp + version)
- [x] **COMP-02**: User sees pre-registration info screen explaining required documents before starting KYC
- [x] **COMP-03**: User sees daily transfer limit acknowledgment screen during registration
- [x] **COMP-04**: User completes selfie/liveness capture with face guide overlay during eKYC
- [ ] **COMP-05**: User can update work permit via standalone 2nd document verification flow (front + back capture)

### P2P Transfer

- [x] **P2P-01**: User can send THB to another wallet by entering receiver wallet ID
- [x] **P2P-02**: User can send THB by scanning receiver's wallet QR code
- [x] **P2P-03**: User sees confirmation screen with sender/receiver details, amount, and fees before passcode
- [x] **P2P-04**: User receives transaction receipt after successful P2P transfer

### Transfer Channels

- [x] **CHAN-01**: User can select cash pick-up as a transfer channel
- [x] **CHAN-02**: User sees system-generated secret code on receipt for cash pick-up transfers
- [x] **CHAN-03**: User can copy and refresh cash pick-up secret code from receipt

### Add Money

- [ ] **TOPUP-01**: User can top up via 123 Service convenience store channel
- [ ] **TOPUP-02**: User sees barcode (Code 128) with Ref.1, Ref.2, amount, and pay-before timestamp for 123 Service

### Bank Accounts

- [ ] **BANK-01**: User can add a bank account (bank name, account number, account name) for withdrawal
- [ ] **BANK-02**: User can delete a saved bank account (with confirmation dialog)
- [ ] **BANK-03**: User can select from saved bank accounts during withdrawal flow
- [ ] **BANK-04**: System prevents deletion of bank account with pending withdrawal

### Recipient Management

- [x] **REC-01**: User can toggle favourite on recipients (star icon)
- [ ] **REC-02**: User can filter recipient list by favourites
- [ ] **REC-03**: Favourite recipients sort to top of the list
- [ ] **REC-04**: User can enter Myanmar address via cascading pickers (State → Township → Ward/Village)

### Transaction History

- [x] **HIST-01**: User can share e-receipt as image via native share sheet
- [x] **HIST-02**: User can download e-receipt as PNG image

### Visa Card

- [ ] **VISA-01**: User can request a Visa card from the card screen
- [ ] **VISA-02**: User can select delivery address (current or mailing) during card request
- [ ] **VISA-03**: User sees FX conversion details on card payment confirmation
- [ ] **VISA-04**: User sees success/fail modal after card payment attempt

### Engagement

- [ ] **REF-01**: User can see referral stats (count of referred friends, bonus earned)
- [ ] **REF-02**: User can share referral via WhatsApp, Line, or copy link
- [ ] **NOTIF-01**: User can view notification inbox from home screen bell icon
- [ ] **NOTIF-02**: User sees unread badge count on notification bell
- [ ] **NOTIF-03**: User can mark notifications as read

### Authentication

- [ ] **AUTH-01**: User can enable biometric login (Face ID / Touch ID / Fingerprint) from profile settings
- [ ] **AUTH-02**: User can authenticate with biometrics instead of passcode on login

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Payments
- **PAY-01**: User can pay bills via bill payment feature
- **PAY-02**: User can download transaction statement as PDF

### Support
- **SUP-01**: User can chat with support in-app
- **SUP-02**: User can browse FAQ with search

### Marketing
- **MKT-01**: User can redeem promotional vouchers
- **MKT-02**: Admin can manage CMS-driven promotional banners

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real eKYC integration | Mock service only — configurable pass/fail via env vars |
| Real payment processing | Mock service only — configurable delays/rates |
| Real SMS/OTP delivery | Mock flow with auto-bypass for development |
| Native mobile app | PWA only — no iOS/Android native builds |
| Admin dashboard | User-facing app only |
| Real Visa card issuance | UI mockup with fake data |
| Real-time chat support | Deferred to v2 |
| Bill payments | Placeholder page only — deferred to v2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMP-01 | Phase 9 | Complete |
| COMP-02 | Phase 9 | Complete |
| COMP-03 | Phase 9 | Complete |
| COMP-04 | Phase 9 | Complete |
| COMP-05 | Phase 12 | Pending |
| P2P-01 | Phase 10 | Complete |
| P2P-02 | Phase 10 | Complete |
| P2P-03 | Phase 10 | Complete |
| P2P-04 | Phase 10 | Complete |
| CHAN-01 | Phase 10 | Complete |
| CHAN-02 | Phase 10 | Complete |
| CHAN-03 | Phase 10 | Complete |
| TOPUP-01 | Phase 11 | Pending |
| TOPUP-02 | Phase 11 | Pending |
| BANK-01 | Phase 11 | Pending |
| BANK-02 | Phase 11 | Pending |
| BANK-03 | Phase 11 | Pending |
| BANK-04 | Phase 11 | Pending |
| REC-01 | Phase 10 | Complete |
| REC-02 | Phase 10 | Pending |
| REC-03 | Phase 10 | Pending |
| REC-04 | Phase 11 | Pending |
| HIST-01 | Phase 10 | Complete |
| HIST-02 | Phase 10 | Complete |
| VISA-01 | Phase 12 | Pending |
| VISA-02 | Phase 12 | Pending |
| VISA-03 | Phase 12 | Pending |
| VISA-04 | Phase 12 | Pending |
| REF-01 | Phase 13 | Pending |
| REF-02 | Phase 13 | Pending |
| NOTIF-01 | Phase 13 | Pending |
| NOTIF-02 | Phase 13 | Pending |
| NOTIF-03 | Phase 13 | Pending |
| AUTH-01 | Phase 13 | Pending |
| AUTH-02 | Phase 13 | Pending |

**Coverage:**
- v1.1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-15*
*Last updated: 2026-04-15 after roadmap creation (v1.1 Phases 9-13)*
