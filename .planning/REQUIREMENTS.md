# Requirements: 2C2P Wave

**Defined:** 2026-04-15
**Core Value:** Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance

## v1.2 Requirements

Requirements for milestone v1.2 — Production Readiness. Each maps to roadmap phases.

### PWA & Offline

- [ ] **PWA-01**: App installs as PWA on mobile with proper manifest, icons, and splash screen
- [x] **PWA-02**: App shell (HTML/CSS/JS) is cached for offline access via service worker
- [x] **PWA-03**: Static assets (icons, fonts) use CacheFirst strategy with long TTL
- [x] **PWA-04**: API routes use NetworkFirst strategy with offline fallback message
- [ ] **PWA-05**: User sees install prompt when visiting on mobile browser

### QR Scanner

- [ ] **QR-01**: User can scan QR codes using live camera via @yudiel/react-qr-scanner
- [ ] **QR-02**: Scanned QR auto-detects type (wallet ID for P2P, payment code for receive)

### Database & Auth

- [ ] **DB-01**: WebAuthn columns (credential_id, public_key, counter, challenge) applied to user_profiles
- [ ] **DB-02**: Biometric enrollment works on deployed HTTPS domain with installed PWA

### Testing

- [ ] **TEST-01**: Vitest unit tests cover Zod schemas (auth, transfer, wallet, KYC)
- [ ] **TEST-02**: Vitest unit tests cover currency formatting edge cases (THB/MMK)
- [ ] **TEST-03**: Vitest + RTL tests cover form components (registration, recipient, amount)
- [ ] **TEST-04**: Playwright E2E test covers registration → KYC happy path
- [ ] **TEST-05**: Playwright E2E test covers transfer confirmation → receipt happy path

### Features

- [ ] **FEAT-01**: User can download transaction statement as PDF for a date range
- [ ] **FEAT-02**: User can view and edit personal spending limits from profile

## v2 Requirements

Deferred to future release.

### Payments
- **PAY-01**: User can pay bills via bill payment feature
- **PAY-02**: User can redeem promotional vouchers

### Support
- **SUP-01**: User can chat with support in-app
- **SUP-02**: User can browse FAQ with search

### Infrastructure
- **INFRA-01**: Real push notifications via FCM/APNs
- **INFRA-02**: Admin dashboard for KYC review and user management

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real eKYC integration | Mock service only — production integration is a separate project |
| Real payment processing | Mock service only — requires 2C2P API contract |
| Real SMS/OTP delivery | Mock flow — requires SMS gateway contract |
| Native mobile app | PWA covers mobile needs |
| Admin dashboard | Separate project scope |
| In-app chat | Deferred to v2 |
| Bill payments | Deferred to v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PWA-01 | Phase 14 | Pending |
| PWA-02 | Phase 14 | Complete |
| PWA-03 | Phase 14 | Complete |
| PWA-04 | Phase 14 | Complete |
| PWA-05 | Phase 14 | Pending |
| QR-01 | Phase 15 | Pending |
| QR-02 | Phase 15 | Pending |
| DB-01 | Phase 15 | Pending |
| DB-02 | Phase 15 | Pending |
| TEST-01 | Phase 16 | Pending |
| TEST-02 | Phase 16 | Pending |
| TEST-03 | Phase 16 | Pending |
| TEST-04 | Phase 16 | Pending |
| TEST-05 | Phase 16 | Pending |
| FEAT-01 | Phase 17 | Pending |
| FEAT-02 | Phase 17 | Pending |

**Coverage:**
- v1.2 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-15*
*Last updated: 2026-04-15 after v1.2 roadmap creation*
