# Project Research Summary

**Project:** 2C2P Wave — Mobile Banking & Remittance PWA (v1.1)
**Domain:** Mobile banking / cross-border remittance — Thailand (THB) to Myanmar (MMK)
**Researched:** 2026-04-15
**Confidence:** HIGH

## Executive Summary

2C2P Wave v1.1 is a feature completion sprint: the v1.0 foundation (auth, KYC, wallet, add-money, transfer, withdrawal, history, virtual card, profile, QR) is live and locked. The 15 new features fill specific gaps between the Pencil design and the shipped code, targeting three categories: regulatory compliance (T&C consent, pre-registration limits, work permit update), core wallet completeness (P2P transfer, cash pick-up, 123 Service top-up, bank account management, e-receipt share, recipient favourites), and engagement/retention (notification inbox, Myanmar address cascade, referral stats, Visa card request, biometric login). The stack is already scaffolded and locked — no framework decisions remain. All 5 new library additions needed (`@yudiel/react-qr-scanner`, `react-barcode`, `html-to-image`, `@simplewebauthn/browser`, `@simplewebauthn/server`) are well-understood with clear rationale.

The recommended approach is to sequence work by dependency chain and compliance risk: PDPA-mandated consent screens and registration pre-checks come first (they gate every new user), followed by foundational UX additions that the rest of the features depend on (e-receipt share, bank account management, P2P transfer store isolation), then KYC and account completeness features (selfie/liveness, 123 Service, work permit update), then engagement and differentiation features (notification inbox, address cascade, referral, Visa card), and finally the highest-complexity feature that needs the most platform-specific testing (biometric login). This ordering ensures the app stays legally compliant at every deploy point and that shared building blocks are stable before dependent features are built on top of them.

The dominant risk profile is iOS PWA platform constraints: camera permission re-prompts on route changes affect selfie capture and QR scanning; live camera streaming is impossible in iOS PWA standalone mode (file-input fallback required); and WebAuthn credential storage has a 7-day ITP expiry if stored in cookies rather than server-side. A secondary risk class is financial data integrity: the cash pick-up secret code must be generated server-side only, bank account deletion requires soft-delete with FK guard, and the Visa card payment flow must inherit the existing rate-expiry and idempotency patterns from the A/C transfer flow. Every pitfall has a clear prevention strategy — the risk is not the pitfall's existence but failing to apply the known fix.

## Key Findings

### Recommended Stack

The base stack (Next.js 16.2.3, Supabase, shadcn/ui, Zustand v5, SWR, react-hook-form v7 + zod v4, next-intl v4, react-qr-code, Serwist) is fully installed and locked. Five new libraries are required for v1.1 features only.

**Core technologies (existing — confirmed locked):**
- `next` 16.2.3: App Router with `proxy.ts` (not `middleware.ts`) for auth guard on every request
- `@supabase/supabase-js` + `@supabase/ssr`: Auth (Phone OTP), PostgreSQL + RLS, Realtime, Storage
- `zustand` v5 + store-factory pattern: Multi-step flow state; Zustand persist `version` field required for schema migrations
- `swr` v2.4.1: Server-fetched data (recipients, transactions, rates); 5.3KB vs TanStack Query 16.2KB
- `next-intl` v4.9.1: ESM-only; `getRequestConfig` must return `locale`; do NOT pass `messages` prop to `NextIntlClientProvider`
- `@hookform/resolvers` v5.2.2 + `zod` v4: v5.2.2 is the minimum required for zod v4 compat — do not downgrade either

**New libraries required for v1.1:**
- `@yudiel/react-qr-scanner` v2.5.1: P2P wallet QR scan; requires dual-mode (live stream Android, file-input iOS PWA)
- `react-barcode` v1.6.1: Code 128 linear barcode for 123 Service top-up; SVG renderer; 105K weekly downloads
- `html-to-image` v1.11.13: E-receipt PNG export; await `document.fonts.ready` before calling; browser-only (no SSR)
- `@simplewebauthn/browser` + `@simplewebauthn/server` v13.3.0: WebAuthn biometric login; server package requires Node.js runtime (not Edge)

**What NOT to add:** `html5-qrcode` (large bundle), `react-webcam` (iOS permission re-prompts), `html2canvas` (SVG/font bugs, not ESM), raw `navigator.credentials` (200+ lines boilerplate), `next-pwa` (broken on Next.js 15+), any push notification library (out of scope per PROJECT.md).

### Expected Features

**Must have (table stakes — P1):**
- T&C / Privacy consent — PDPA B.E.2562 compliance (THB 21.5M fines active Aug 2025); granular consent; no pre-ticked boxes; store timestamp + version
- Pre-registration info + daily limit acknowledgment — regulatory audit trail; must appear before registration, not as a transfer gate
- Selfie / liveness capture — completes existing eKYC flow; circular overlay + single-page sequence (iOS camera re-prompt avoidance)
- Bank account management (add/delete saved accounts) — required for withdrawal UX; soft-delete with FK guard against pending withdrawals
- E-receipt share / download — users share receipts with family via WhatsApp; PNG via `html-to-image` + Web Share API
- Cash pick-up transfer channel with secret code — ~40% of Myanmar rural population is unbanked; code must be generated server-side only
- P2P wallet-to-wallet transfer — direct wallet-to-wallet; separate store from A/C transfer to prevent state collision
- Recipient favourites toggle + filter — ~2-3 hour implementation; SWR optimistic update

**Should have (differentiators — P2):**
- Notification inbox + unread badge — new `notifications` Supabase table required; Supabase Realtime for live updates; no real push notifications
- Myanmar address cascade — static JSON (State/Region → Township → Ward); lazy-load ward level; reusable component for 3 forms
- Work permit / 2nd document update — adds `PENDING_UPDATE` KYC status; blocks new transfers but not in-flight ones
- Referral stats + social share — Web Share API + WhatsApp/Line URL schemes; no SDK needed
- 123 Service convenience store top-up — Code 128 barcode (not QR); `react-barcode` SVG renderer; quiet zone minimum 10px
- Visa card request + payment flow — highest complexity (HIGH); reuse `RateTimer` + idempotency key pattern from existing transfer flow

**Defer (P3):**
- Biometric login — HIGH complexity; iOS PWA constraints; WebAuthn credential ID must be stored in Supabase (not cookies — 7-day ITP expiry)
- Real push notifications — ops complexity; iOS permission UX causes abandonment; in-app inbox is sufficient
- PDF receipt — server-side PDF generation overhead; PNG via Web Share API meets the user goal
- Animated liveness challenge — requires ML vendor SDK; passive single-photo liveness sufficient for mock service

### Architecture Approach

The architecture follows strict RSC-first: Server Components fetch Supabase data at request time via the server client (anon key + RLS), Client Components own only UI interaction state, and all financial mutations flow through Route Handlers using the service role key (never exposed to the client). Multi-step flows use Zustand stores with `persist` middleware against `sessionStorage`. The `proxy.ts` auth guard runs on every request; financial state is validated server-side before processing.

**Major components:**
1. `proxy.ts` — auth guard + session refresh on every request; redirects unauthenticated users to `/login`
2. Route groups `(auth)` / `(main)` — shell separation; `(main)` mounts BottomNav, `(auth)` is bare
3. Mock service Route Handlers (`/api/mock-kyc/`, `/api/mock-payment/`) — simulate vendors; behavior via env vars; service role key for DB writes
4. Zustand stores per flow — `registrationStore`, `useTransferStore`, new `p2pTransferStore` — each isolated with `reset()` on entry; never share stores across incompatible flows
5. Supabase Realtime subscriptions — transaction status updates and notification inbox; always `channel.unsubscribe()` in `useEffect` cleanup
6. SWR data layer — recipients list, transactions, exchange rates; optimistic updates for favourites and inbox read state

**v1.1 new routes:**
`/transfer/p2p/` + `/transfer/p2p/confirm/` + `/transfer/p2p/receipt/`, `/profile/bank-accounts/`, `/notifications/`, `/card/request/`, `/profile/documents/`, plus pre-registration screens before `(auth)/register/`

### Critical Pitfalls

1. **P2P / A/C transfer store collision** — Create `p2p-store.ts` entirely separate from `transfer-store.ts`; call `reset()` on both stores at each flow's entry point. Corruption is silent — the confirm page renders with wrong data shape before redirecting.

2. **iOS Safari camera re-prompt on route navigation** — Keep the entire KYC sequence (document scan + selfie) as a single-page state machine with no route changes while camera is active; initialize `getUserMedia` once per component mount; use CSS `visibility` (not conditional rendering) on the Scan tab.

3. **Cash pick-up secret code generated client-side** — Generate exclusively in the mock payment Route Handler using `crypto.randomBytes(4).toString('hex').toUpperCase()`; the receipt page fetches from Supabase by transaction ID, never from Zustand.

4. **T&C step breaks registration store state machine** — Add `tcAccepted: boolean` as a separate Zustand field (not a renumbered step); bump Zustand persist `version` on any schema change to trigger `onRehydrateStorage` migration; mid-registration users on deploy must not lose progress.

5. **E-receipt export fails on Myanmar script and cross-origin assets** — Await `document.fonts.ready` before calling `html-to-image`; configure Supabase Storage CORS for the app origin; use fixed scale `2` (not `devicePixelRatio` which is `3` on iPhone = 9x pixel area).

6. **123 Service barcode is wrong format** — `react-barcode` renders Code 128 (linear), not QR. SVG renderer, minimum 280px wide, 10px horizontal padding for quiet zones. Test by scanning with a 1D laser scanner before shipping.

7. **Biometric credential stored in cookies** — Store credential ID in Supabase `user_preferences` (not `localStorage` or `document.cookie`); gate biometric option on `window.matchMedia('(display-mode: standalone)').matches`; Safari ITP expires cookies silently after 7 days.

## Implications for Roadmap

Based on combined research, the 15 features map to 5 natural phases ordered by dependency chain and compliance risk.

### Phase 1: Compliance + Registration Foundation
**Rationale:** PDPA consent and pre-registration acknowledgment are legal requirements that gate every new user. They are also the lowest-complexity features — quick wins that de-risk compliance at the start of the sprint.
**Delivers:** PDPA-compliant registration entry; daily limit acknowledgment audit trail; updated registration store with Zustand persist v2 migration for `tcAccepted` field
**Addresses:** T&C / Privacy consent (P1), Pre-registration info + daily limit (P1)
**Avoids:** Pitfall 5 — use `tcAccepted: boolean` field, not renumbered steps; bump persist version
**Research flag:** Standard patterns. No deeper research needed.

### Phase 2: Transfer Enhancements
**Rationale:** E-receipt share is a prerequisite for cash pick-up (the secret code must be shareable). P2P must be built with a separate Zustand store before the QR scan tab is refactored. All three features are P1 and share the transfer/receipt domain.
**Delivers:** Shareable e-receipts (PNG via Web Share API); cash pick-up channel with server-generated secret code; P2P wallet-to-wallet transfer with isolated store; recipient favourites toggle
**Addresses:** E-receipt share (P1), Cash pick-up with secret code (P1), P2P wallet transfer (P1), Recipient favourites (P1)
**Avoids:** Pitfall 1 (P2P/A/C store collision), Pitfall 3 (secret code client-side generation), Pitfall 8 (e-receipt Myanmar font + CORS)
**Stack additions:** `html-to-image`, `@yudiel/react-qr-scanner`
**Research flag:** Standard patterns. P2P store isolation and Web Share API well-specified in research.

### Phase 3: KYC + Account Completeness
**Rationale:** Selfie/liveness completes the KYC flow and shares the iOS-safe single-page camera pattern. Bank account management, 123 Service, and work permit update are self-contained features that close gaps in existing flows (KYC, withdrawal, add-money, profile).
**Delivers:** Selfie/liveness capture with circular overlay; bank account CRUD with soft-delete + FK guard; 123 Service Code 128 barcode top-up; work permit / 2nd document update with `PENDING_UPDATE` KYC status
**Addresses:** Selfie / liveness (P1), Bank account management (P1), 123 Service top-up (P1), Work permit update (P2)
**Avoids:** Pitfall 2 (iOS camera re-prompt), Pitfall 4 (bank account deletion with pending withdrawals), Pitfall 6 (KYC state machine regression), Pitfall 10 (123 barcode wrong format)
**Stack additions:** `react-barcode` v1.6.1
**New schema:** `PENDING_UPDATE` KYC status enum value; `saved_bank_accounts` table with soft-delete; `bank_account_id` FK on withdrawal records
**Research flag:** Standard patterns.

### Phase 4: Engagement + Growth Features
**Rationale:** These features enhance existing surfaces (referral page, virtual card screen) or require new infrastructure (notifications schema, Myanmar address JSON). The Visa card flow is the highest-complexity feature in the sprint and benefits from all prior patterns being stable.
**Delivers:** Notification inbox with unread badge (Supabase Realtime); Myanmar address cascade component (static JSON, lazy-loaded); referral stats + WhatsApp/Line/copy share; Visa card request + payment flow
**Addresses:** Notification inbox (P2), Myanmar address cascade (P2), Referral stats + social share (P2), Visa card request (P2)
**Avoids:** Pitfall 7 (FX rate staleness / double charge on Visa payment — reuse `RateTimer` + idempotency key from existing transfer confirm)
**New schema:** `notifications(id, user_id, type enum, title_en/th/mm, body_en/th/mm, read boolean, metadata jsonb, created_at)`
**Research flag:** Myanmar address data source (MIMU Pcode JSON) should be fetched and inspected before planning to determine actual bundle size. Visa card idempotency key enhancement needs to be planned for the mock payment API, not just the UI.

### Phase 5: Biometric Login
**Rationale:** WebAuthn is the highest-complexity feature with the most platform-specific constraints. Isolating it last ensures all other features are stable, the PWA is installable (prerequisite for Face ID on iOS), and the credential storage design can be informed by the full session pattern from prior phases.
**Delivers:** WebAuthn biometric login (Face ID / Touch ID / Fingerprint); post-passcode enrollment flow; credential ID stored server-side only; graceful fallback to passcode
**Addresses:** Biometric login (P3)
**Avoids:** Pitfall 9 (credential stored in cookies — use Supabase `user_preferences`; gate on `display-mode: standalone`)
**Stack additions:** `@simplewebauthn/browser` v13.3.0, `@simplewebauthn/server` v13.3.0 (Node.js runtime only)
**New schema:** `webauthn_credentials(id, user_id, credential_id, public_key, counter, created_at)`
**Research flag:** Recommend `/gsd:research-phase` — WebAuthn platform authenticator behavior varies across iOS versions and Android browsers. Testing requires HTTPS deployed domain (localhost credentials do not transfer to production origin).

### Phase Ordering Rationale

- Compliance first ensures legal validity at every deploy point (PDPA fines are active)
- Transfer domain grouped (Phase 2) because e-receipt → cash pick-up dependency is hard; P2P store isolation is foundational and must precede QR scan refactor
- KYC + account features grouped (Phase 3) because the iOS single-page camera pattern is implemented once and shared across selfie, document capture, and work permit update
- Engagement features deferred to Phase 4 because they require new schema (notifications) and external data verification (MIMU Pcode)
- Biometric isolated last because it requires the PWA to be installed and HTTPS-deployed for meaningful testing

### Research Flags

Phases needing deeper research during planning:
- **Phase 5 (Biometric):** WebAuthn behavior varies by iOS version and Android browser; testing requires deployed HTTPS domain; recommend `/gsd:research-phase`
- **Phase 4 (Myanmar address cascade):** Verify MIMU Pcode JSON structure and actual file size before committing to lazy-load strategy

Phases with standard patterns (skip research-phase):
- **Phase 1:** Zustand persist migration and PDPA checkbox form are well-documented
- **Phase 2:** Web Share API, SWR optimistic updates, Supabase Realtime, and store isolation patterns are established in the existing codebase
- **Phase 3:** `react-barcode` documentation is clear; iOS single-page camera pattern is fully specified in ARCHITECTURE.md and PITFALLS.md

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries verified via npm CLI; version compatibility confirmed; 5 new libraries have clear justification with no competing candidates |
| Features | HIGH | 15 features fully specified with implementation notes, dependency graph, and prioritization matrix; PDPA compliance verified against official sources |
| Architecture | HIGH | Based on live scaffolded codebase; RSC boundaries, store patterns, and mock service contracts proven in v1.0 |
| Pitfalls | HIGH | iOS camera re-prompt and WebAuthn ITP verified against WebKit bug tracker and Apple docs; financial integrity pitfalls have clear, tested prevention patterns |

**Overall confidence:** HIGH

### Gaps to Address

- **Myanmar address data source:** MIMU Pcode JSON (MyanmarPost/MyanmarPostalCode) must be fetched and inspected during Phase 4 planning to assess actual bundle size and township count per state before designing the lazy-load strategy.
- **Supabase Storage CORS:** Existing v1.0 KYC documents bucket may lack CORS configuration for the app origin. Must be verified before Phase 2 e-receipt export work begins — blank logos in exported images are a silent failure.
- **WebAuthn iOS minimum version:** The target persona may include iOS < 16.4 devices. Phase 5 planning must define a minimum iOS version for biometric support and design a clear fallback message.
- **Visa card mock API idempotency:** The mock payment API currently does not enforce idempotency keys. Phase 4 planning must include a mock API enhancement to reject duplicate `idempotency_key` values within a 5-minute window.

## Sources

### Primary (HIGH confidence)
- Official next-intl v4 release notes: https://next-intl.dev/blog/next-intl-4-0
- SimpleWebAuthn official docs: https://simplewebauthn.dev/
- WebKit Face ID / Touch ID for the Web: https://webkit.org/blog/11312/meet-face-id-and-touch-id-for-the-web/
- WebKit bug #215884 (camera permission re-prompt): https://bugs.webkit.org/show_bug.cgi?id=215884
- Next.js Vitest guide: https://nextjs.org/docs/app/guides/testing/vitest
- Next.js PWA guide (Serwist): https://nextjs.org/docs/app/guides/progressive-web-apps
- Serwist Next.js docs: https://serwist.pages.dev/docs/next/getting-started
- Thailand PDPA enforcement: https://cookieinformation.com/what-is-the-thailand-pdpa/
- MIMU Myanmar Pcode dataset: https://themimu.info/place-codes
- npm version verification: `npm info` CLI for all new packages

### Secondary (MEDIUM confidence)
- iOS PWA camera limitation: https://dev.to/niscontractor/qr-code-integration-in-pwa-and-its-challenges-18o4
- html-to-image vs html2canvas comparison: https://npm-compare.com/dom-to-image,html-to-image,html2canvas
- SWR vs TanStack Query 2025: https://refine.dev/blog/react-query-vs-tanstack-query-vs-swr-2025/
- Supabase soft delete with RLS: https://github.com/orgs/supabase/discussions/2799
- PWA iOS limitations 2025: https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide

### Tertiary (LOW confidence)
- P2P payment app UX patterns 2025: https://medium.com/@Shakuro/how-to-build-a-p2p-payment-app-in-2025-42d22aa06d97
- Idempotency strategies for payment systems: https://medium.com/javarevisited/idempotency-strategies-for-modern-payment-systems-c285165382f4

---
*Research completed: 2026-04-15*
*Ready for roadmap: yes*
