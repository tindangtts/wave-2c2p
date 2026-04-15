# Milestones: 2C2P Wave

## v1.2 Production Readiness (Shipped: 2026-04-15)

**Phases completed:** 4 phases, 12 plans
**Files changed:** 92 | **LOC added:** ~10,680

**Key accomplishments:**

- PWA & Offline: Serwist service worker with CacheFirst/NetworkFirst caching, offline fallback, install prompt (Android + iOS)
- Live QR Scanner: @yudiel/react-qr-scanner replacing mock camera, QR type detection routing, BarcodeDetector gallery fallback
- WebAuthn DB Migration: 4 credential columns on user_profiles for production biometric auth
- Test Coverage: 109 Vitest unit/RTL tests + 5 Playwright E2E tests (schemas, forms, registration, transfer)
- PDF Statement Download: jsPDF generation with date range picker on history page
- Spending Limits: Tier-based daily/monthly limit selector from profile settings

### Archive

- [v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md) — Full phase details
- [v1.2-REQUIREMENTS.md](milestones/v1.2-REQUIREMENTS.md) — All 17 requirements with traceability
- [v1.2-MILESTONE-AUDIT.md](../v1.2-MILESTONE-AUDIT.md) — Final audit report

---

## v1.1 Feature Completeness (Shipped: 2026-04-15)

**Phases completed:** 5 phases, 20 plans, 27 tasks

**Key accomplishments:**

- One-liner:
- One-liner:
- P2P Zustand store, wallet-to-wallet transfer API with balance debit/credit, stateless secret-code refresh, and TransferChannel extended with "p2p"
- P2P wallet ID entry and amount screens wired to p2p-store, with regex validation, balance guard, and sticky yellow CTAs following existing transfer screen patterns
- One-liner:
- One-liner:
- One-liner:
- Code 128 barcode top-up screen for 123 Service convenience stores using react-barcode, with Ref.1/Ref.2 refs, 30-minute expiry timer, and regenerate flow
- One-liner:
- One-liner:
- myanmar-address-data.ts
- One-liner:
- Address selection step:
- One-liner:
- Referral stats API (/api/referral/stats) + refer-friends page with 2-card stats display and WhatsApp/Line/Copy social share buttons wired to live data
- GET/PATCH /api/notifications with demo data, Notification TypeScript type, and full i18n strings across 3 locales — data layer ready for Plan 03 inbox UI
- Bell icon with live unread badge and /home/notifications inbox with optimistic mark-one/mark-all-read via PATCH /api/notifications
- Profile page (`src/app/(main)/profile/page.tsx`):

---

## v1.0 MVP — Shipped 2026-04-15

**Phases:** 8 | **Plans:** 27 | **Requirements:** 63/63
**Timeline:** 2026-04-14 → 2026-04-15 (144 commits, 17,268 LOC TypeScript)

### Key Accomplishments

1. Phone-based authentication with OTP, multi-step registration, and PBKDF2 passcode
2. eKYC document verification with camera capture, mock approval/rejection, and re-submission
3. Cross-border THB→MMK transfer with live conversion, channel selection, passcode confirmation, and receipt
4. Wallet operations: add money via QR, withdrawal, transaction history with infinite scroll and Buddhist calendar
5. Profile management, virtual Visa card (reveal/freeze), language switching (EN/TH/MM)
6. Full cross-phase integration verified — 5/5 E2E flows passing

### Archive

- [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) — Full phase details
- [v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md) — All 63 requirements with traceability
- [v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md) — Final audit report
