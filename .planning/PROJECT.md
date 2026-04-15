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

### Active

<!-- v1.1 Feature Completeness — close all Pencil/PRD gaps -->

- [ ] P2P wallet-to-wallet transfer (wallet ID entry + QR scan)
- [ ] Bank account management for withdrawals (add/delete saved accounts)
- [ ] Cash pick-up transfer channel with secret code generation
- [ ] T&C / Privacy consent screen during registration
- [ ] Selfie/liveness capture with face guide overlay
- [ ] 123 Service convenience store top-up channel
- [ ] Visa card request + payment flow (address selection, FX, success/fail)
- [ ] Work permit / 2nd document update flow
- [ ] Myanmar address cascade (State → Township → Ward/Village)
- [ ] E-receipt share/download as image
- [ ] Recipient favourites toggle + filter
- [ ] Referral stats + social share buttons (WhatsApp, Line, copy link)
- [ ] Pre-registration info + daily limit acknowledgment screens
- [ ] Biometric login option (Face ID / Touch ID / Fingerprint)
- [ ] Notification inbox with unread badge

## Current Milestone: v1.1 Feature Completeness

**Goal:** Close all remaining gaps between Pencil design / PRD and the shipped codebase — deliver every designed screen and specified feature.

**Target features:**
- P2P wallet-to-wallet transfer (wallet ID + QR)
- Bank account CRUD for withdrawals
- Cash pick-up channel with secret code
- T&C consent during registration
- Selfie/liveness capture
- 123 Service top-up
- Visa card request + payment flow
- Work permit update flow
- Myanmar address cascade
- E-receipt share/download
- Recipient favourites
- Referral stats + social sharing
- Pre-registration + daily limit screens
- Biometric login
- Notification inbox

### Out of Scope

- Real eKYC integration — mock service only (configurable pass/fail)
- Real payment processing — mock service only (configurable delays/rates)
- Real SMS/OTP delivery — mock flow with auto-bypass for development
- Push notifications — placeholder UI only
- Bills payment — placeholder page only
- Real Visa card issuance — UI mockup with fake data
- Native mobile app — PWA only
- Admin dashboard — user-facing app only
- Real-time chat support — static contact info only

## Context

**Shipped v1.0 MVP** on 2026-04-15 with 17,268 LOC TypeScript across 144 commits.

- **Tech Stack**: Next.js 16.2.3 (App Router), Supabase (auth/DB/storage), shadcn/ui, Tailwind CSS v4, TypeScript
- **Brand**: Yellow #FFE600 primary, Blue #0091EA secondary, dark text #212121 on yellow (WCAG AA)
- **Target**: Mobile-first PWA, 375-430px viewport, iOS-style chrome
- **Markets**: Thailand ↔ Myanmar corridor, migrant worker primary persona
- **Languages**: English, Thai, Myanmar (Burmese) — fully implemented with next-intl
- **Prototype**: 24+ screens designed in Pencil (`/pencil-new.pen`), fully implemented
- **Mock Services**: eKYC and payment via env-var-configurable mock APIs
- **Auth**: Phone OTP + PBKDF2 passcode with Supabase session management
- **Integration**: 5/5 E2E flows verified (registration→KYC, transfer, add money, withdrawal, profile)

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
| Next.js 16 with App Router | Latest stable, Server Components, proxy.ts pattern | — Pending |
| Supabase over custom backend | Phone auth built-in, RLS policies, real-time, fast setup | — Pending |
| shadcn/ui over custom components | Consistent design system, accessible defaults, easy theming | — Pending |
| Mock eKYC/payment services | Avoid real integrations for MVP, configurable for demos | — Pending |
| PWA over native app | Wider reach, single codebase, installable on mobile | — Pending |
| proxy.ts over middleware.ts | Next.js 16 convention, full Node.js runtime | — Pending |

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
*Last updated: 2026-04-15 after v1.1 milestone start*
