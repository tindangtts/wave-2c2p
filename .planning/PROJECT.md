# 2C2P Wave

## What This Is

A mobile-first progressive web app for cross-border money transfers between Thailand (THB) and Myanmar (MMK). It serves migrant workers and individuals who need to send money home, manage digital wallets, complete eKYC verification, and access basic banking services through a simple, accessible mobile interface.

## Core Value

Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance — the entire flow from registration through transfer must work reliably on low-end smartphones with spotty connectivity.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Phone-based login with country code selector (+66 TH, +95 MM) and OTP verification
- [ ] Multi-step registration with personal info and ID details
- [ ] eKYC document scanning (ID front/back, work permit) with camera overlay — mock service
- [ ] Face verification with liveness detection circular frame — mock service
- [ ] KYC status management (pending/approved/rejected/expired) with re-submission flow
- [ ] Home dashboard with wallet balance, quick actions grid, recent transactions, promo carousel
- [ ] Digital wallet with balance display, show/hide toggle, wallet ID
- [ ] Add money via bank/convenience store channels with QR code generation
- [ ] P2P money transfer with THB→MMK conversion, channel selection (Wave Agent/App/Bank/Cash Pickup)
- [ ] Fee calculation and display per receiving channel — mock payment service
- [ ] Recipient management (add/edit/delete with name, phone, NRC, occupation, purpose, relationship)
- [ ] Transfer confirmation with passcode and receipt generation
- [ ] Withdrawal flow with recipient selection, amount entry, bank selection
- [ ] Transaction history with date range filter, status filter, detail/receipt view
- [ ] Virtual Visa card display with card details reveal, balance, freeze
- [ ] Profile settings (info, passcode change, phone number change, notifications)
- [ ] Refer friends with QR code and share link, monthly referral tracking
- [ ] Contact us page (call center, Messenger, Email, Viber, resources)
- [ ] Language switching (English/Thai/Myanmar)
- [ ] Bottom navigation (Home, Scan, Add Money, Profile) matching prototype
- [ ] System state screens (maintenance, update required, profile rejected)
- [ ] Design system with shadcn/ui components matching prototype aesthetic (yellow/blue brand)
- [ ] QR scanner page for payment/transfer initiation

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

- **Prototype**: 24+ screens designed in Pencil (`/pencil-new.pen`), fully analyzed
- **UI/UX Review**: Comprehensive analysis at `.planning/UI-UX-REVIEW.md` covering design system, 30+ components, accessibility audit, shadcn mapping, full CSS tokens
- **Tech Stack**: Next.js 16.2.3 (App Router), Supabase (auth/DB/storage), shadcn/ui, Tailwind CSS v4, TypeScript
- **Scaffold**: Project already scaffolded with 16 routes compiling, all shadcn components installed
- **Brand**: Yellow #FFE600 primary, Blue #0091EA secondary, dark text #212121 on yellow (WCAG AA)
- **Target**: Mobile-first PWA, 375-430px viewport, iOS-style chrome
- **Markets**: Thailand ↔ Myanmar corridor, migrant worker primary persona
- **Languages**: English, Thai, Myanmar (Burmese) — i18n required

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
*Last updated: 2026-04-14 after initialization*
