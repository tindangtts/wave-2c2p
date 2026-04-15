# 2C2P Wave

## What This Is

A mobile-first progressive web app for cross-border money transfers between Thailand (THB) and Myanmar (MMK). It serves migrant workers and individuals who need to send money home, manage digital wallets, complete eKYC verification, and access basic banking services through a simple, accessible mobile interface.

## Core Value

Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance — the entire flow from registration through transfer must work reliably on low-end smartphones with spotty connectivity.

## Requirements

### Validated

- ✓ Phone-based login with country code selector (+66 TH, +95 MM) and OTP verification — v1.0
- ✓ Multi-step registration with personal info and ID details — v1.0
- ✓ eKYC document scanning with camera overlay — mock service — v1.0
- ✓ Face verification with liveness detection circular frame — mock service — v1.0
- ✓ KYC status management (pending/approved/rejected/expired) with re-submission flow — v1.0
- ✓ Home dashboard with wallet balance, quick actions grid, recent transactions, promo carousel — v1.0
- ✓ Digital wallet with balance display, show/hide toggle, wallet ID — v1.0
- ✓ Add money via bank/convenience store channels with QR code generation — v1.0
- ✓ P2P money transfer with THB→MMK conversion, channel selection — v1.0
- ✓ Fee calculation and display per receiving channel — mock payment service — v1.0
- ✓ Recipient management (add/edit/delete with AML/EDD fields) — v1.0
- ✓ Transfer confirmation with passcode and receipt generation — v1.0
- ✓ Withdrawal flow with recipient selection, amount entry — v1.0
- ✓ Transaction history with date range filter, status filter, detail view — v1.0
- ✓ Virtual Visa card display with reveal/hide and freeze — v1.0
- ✓ Profile settings (info, passcode change, phone number change) — v1.0
- ✓ Refer friends with QR code and share link — v1.0
- ✓ Contact us page — v1.0
- ✓ Language switching (English/Thai/Myanmar) — v1.0
- ✓ Bottom navigation matching prototype — v1.0
- ✓ System state screens (maintenance, update required) — v1.0
- ✓ Design system with shadcn/ui matching prototype aesthetic — v1.0
- ✓ QR scanner page — v1.0

- ✓ T&C / Privacy consent screen with PDPA-compliant timestamp logging — v1.1
- ✓ Pre-registration info + daily limit acknowledgment screens — v1.1
- ✓ Selfie/liveness capture with circular face guide overlay — v1.1
- ✓ P2P wallet-to-wallet transfer (wallet ID entry + QR scan) — v1.1
- ✓ Cash pick-up transfer channel with server-generated secret code — v1.1
- ✓ E-receipt share/download as PNG via Web Share API — v1.1
- ✓ Recipient favourites toggle + filter tabs — v1.1
- ✓ 123 Service convenience store top-up with Code 128 barcode — v1.1
- ✓ Bank account management for withdrawals (add/delete/select) — v1.1
- ✓ Myanmar address cascade (State → Township → Ward/Village) — v1.1
- ✓ Visa card request + payment flow (address, FX, success/fail) — v1.1
- ✓ Work permit / 2nd document update flow — v1.1
- ✓ Referral stats + social share buttons (WhatsApp, Line, copy link) — v1.1
- ✓ Notification inbox with unread badge — v1.1
- ✓ Biometric login (WebAuthn Face ID / Touch ID / Fingerprint) — v1.1

### Active

<!-- v1.3 Supabase Migration & Auth Hardening -->

- [ ] Wallet balance + transactions read/write from Supabase tables
- [ ] Mock payment APIs write real transactions + update wallet balance in DB
- [ ] Notifications table + API wiring (replace hardcoded demo data)
- [ ] Vouchers table + redemption API wiring
- [ ] Visa card data from Supabase cards table
- [ ] SystemConfig table + maintenance mode check on app open + modal
- [ ] Version gate check on app open + update required modal
- [ ] Permanently rejected number pre-login gate + block modal
- [ ] Single active session (new login invalidates prior token)
- [ ] Remove DEMO_MODE entirely (delete demo.ts, all isDemoMode branches)

## Current Milestone: v1.3 Supabase Migration & Auth Hardening

**Goal:** Wire all demo/mock data to real Supabase tables, implement missing PRD auth requirements, and remove DEMO_MODE fallback.

### Out of Scope

- Real eKYC integration — mock service only (configurable pass/fail)
- Real SMS/OTP delivery — mock flow with auto-bypass for development
- Push notifications — placeholder UI only
- Real Visa card issuance — UI mockup with fake data
- Native mobile app — PWA only
- Admin dashboard — user-facing app only
- Real-time chat support — static contact info only

## Context

**Shipped v1.2 Production Readiness** on 2026-04-15 with PWA, QR scanner, test coverage, PDF statements, and spending limits.

- **Tech Stack**: Next.js 16.2.3 (App Router), Supabase (auth/DB/storage), shadcn/ui, Tailwind CSS v4, TypeScript
- **Brand**: Yellow #FFE600 primary, Blue #0091EA secondary, dark text #212121 on yellow (WCAG AA)
- **Target**: Mobile-first PWA, 375-430px viewport, iOS-style chrome
- **Markets**: Thailand ↔ Myanmar corridor, migrant worker primary persona
- **Languages**: English, Thai, Myanmar (Burmese) — fully implemented with next-intl
- **Prototype**: All 150+ Pencil screens implemented — full design/PRD coverage
- **Mock Services**: eKYC and payment via env-var-configurable mock APIs with demo mode (being removed in v1.3)
- **Auth**: Phone OTP + PBKDF2 passcode + WebAuthn biometric (Face ID/Touch ID)
- **Testing**: 109 Vitest unit/RTL tests + 5 Playwright E2E tests
- **PWA**: Serwist service worker with offline fallback and install prompt
- **Data**: Most API routes still use hardcoded demo data — 72 files reference isDemoMode

## Constraints

- **Tech Stack**: Next.js 16 + Supabase + shadcn/ui — already scaffolded, locked in
- **Mobile-first**: Max 430px container, touch targets 44x44px minimum, safe area handling
- **Mock Services**: eKYC and payment must be mock with configurable behavior via env vars
- **Accessibility**: WCAG 2.1 AA minimum, dark text on yellow backgrounds (contrast ratio)
- **Performance**: LCP < 2.5s on 3G, offline fallback pages
- **i18n**: Must support 3 languages with proper script rendering (Thai, Myanmar/Burmese)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 with App Router | Latest stable, Server Components, proxy.ts pattern | ✓ Good |
| Supabase over custom backend | Phone auth built-in, RLS policies, real-time, fast setup | ✓ Good |
| shadcn/ui over custom components | Consistent design system, accessible defaults, easy theming | ✓ Good |
| Mock eKYC/payment services | Avoid real integrations for MVP, configurable for demos | ✓ Good |
| PWA over native app | Wider reach, single codebase, installable on mobile | ✓ Good |
| proxy.ts over middleware.ts | Next.js 16 convention, full Node.js runtime | ✓ Good |
| Separate P2P store | Avoid collision with A/C transfer store | ✓ Good — v1.1 |
| html-to-image for receipt export | Lighter than html2canvas, better SVG/font handling | ✓ Good — v1.1 |
| WebAuthn for biometric | Platform-native Face ID/Touch ID via browser API | ✓ Good — v1.1 |
| react-barcode for 123 Service | Code 128 SVG for convenience store POS scanners | ✓ Good — v1.1 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-15 after v1.3 milestone start*
