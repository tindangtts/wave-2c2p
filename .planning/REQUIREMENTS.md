# Requirements: 2C2P Wave

**Defined:** 2026-04-15
**Core Value:** Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance

## v1.3 Requirements

Requirements for Supabase Migration & Auth Hardening milestone. Each maps to roadmap phases.

### Supabase Data Migration

- [x] **DATA-01**: Wallet balance reads from `wallets` table instead of hardcoded demo data
- [x] **DATA-02**: Transaction history reads from `transactions` table with proper pagination
- [x] **DATA-03**: Mock payment APIs (transfer, P2P, topup, withdraw) insert real transactions and update wallet balance in Supabase
- [x] **DATA-04**: Notifications stored in new `notifications` table with read/unread status
- [x] **DATA-05**: Voucher codes stored in new `vouchers` table with redemption tracking
- [x] **DATA-06**: Visa card data reads from `cards` table instead of hardcoded mock
- [x] **DATA-07**: Seed SQL file populates all tables with initial data for fresh installs
- [x] **DATA-08**: Remove `demo.ts` and all `isDemoMode` branches from entire codebase

### Auth Hardening

- [x] **AUTH-01**: SystemConfig table with `maintenance_mode` and `min_version`/`recommended_version` keys
- [x] **AUTH-02**: App checks `/system/status` on every open — maintenance mode shows blocking modal
- [x] **AUTH-03**: Version gate check on app open — hard update blocks all actions, soft update dismissible once per session
- [x] **AUTH-04**: Pre-login check for `permanently_rejected` flag — blocked users see rejection modal
- [x] **AUTH-05**: Single active session per user — new login invalidates all prior Supabase sessions

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Transaction Enhancements

- **TXN-01**: Transaction date range filter (week/month/year/custom calendar picker)
- **TXN-02**: Pending transaction auto-refresh every 30s on screen resume
- **TXN-03**: Transfer purpose mandatory dropdown for all transfers
- **TXN-04**: Relationship with sender field for A/C and cash pick-up transfers
- **TXN-05**: Duplicate transfer guard (same wallet+amount within 60s shows confirmation)

### KYC Enhancements

- **KYC-01**: KYC expiry 30-day warning push notification
- **KYC-02**: Exchange rate staleness warning with cached rate indicator

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real eKYC integration | Mock service remains — configurable pass/fail |
| Real SMS/OTP delivery | Mock flow with auto-bypass for development |
| Push notifications | Placeholder UI only — requires native app or web push setup |
| Real Visa card issuance | DB-backed display only, no real card provider integration |
| Admin dashboard | User-facing app only |
| Real-time chat support | Static contact info only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 18 | Complete |
| DATA-02 | Phase 18 | Complete |
| DATA-06 | Phase 18 | Complete |
| DATA-03 | Phase 19 | Complete |
| DATA-04 | Phase 20 | Complete |
| DATA-05 | Phase 20 | Complete |
| DATA-07 | Phase 20 | Complete |
| AUTH-01 | Phase 21 | Complete |
| AUTH-02 | Phase 21 | Complete |
| AUTH-03 | Phase 21 | Complete |
| AUTH-04 | Phase 21 | Complete |
| AUTH-05 | Phase 21 | Complete |
| DATA-08 | Phase 22 | Complete |

**Coverage:**
- v1.3 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-15*
*Last updated: 2026-04-15 after v1.3 roadmap creation*
