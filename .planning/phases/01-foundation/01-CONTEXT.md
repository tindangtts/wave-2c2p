# Phase 1: Foundation - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the complete app shell, design system tokens, Supabase database schema with RLS, mock eKYC/payment API services, i18n infrastructure for 3 languages, and currency arithmetic utilities. This phase builds on the existing Next.js 16 scaffold (16 routes, 20 shadcn components, Supabase clients, mock API routes, CSS design tokens already in place).

</domain>

<decisions>
## Implementation Decisions

### i18n Strategy
- **D-01:** Cookie-based locale routing (NOT URL-prefix) — avoids route restructuring under `[locale]/`, keeps banking URLs clean without PII in paths. Set locale via cookie, read in proxy.ts.
- **D-02:** Message files structured as one JSON per locale per feature — `messages/en/home.json`, `messages/th/auth.json`, `messages/mm/transfer.json`. Keeps bundles small per page.
- **D-03:** next-intl v4 with `createNextIntlPlugin` in next.config.ts. `getRequestConfig` must explicitly return `locale`. `NextIntlClientProvider` inherits server messages automatically.

### Mock Service Behavior
- **D-04:** Mock eKYC defaults to auto-approve after 1500ms delay. Override via `MOCK_KYC_AUTO_APPROVE=false` env var to test rejection flows. Rejection returns randomized reason from a library of 5 common reasons.
- **D-05:** Mock payment defaults to instant success with configurable delay via `MOCK_PAYMENT_DELAY_MS`. Status transitions: pending → processing → completed (or failed if `MOCK_PAYMENT_FAIL=true`).
- **D-06:** Mock exchange rate fixed at 58.148 THB→MMK, configurable via `MOCK_EXCHANGE_RATE_THB_MMK` env var. Rate endpoint returns current timestamp for "freshness" simulation.

### Currency Precision
- **D-07:** All financial calculations use integer arithmetic in smallest currency unit — satang for THB (1 THB = 100 satang), pya for MMK (1 MMK = 100 pya, though practically unused). Store as integers in DB, convert for display only.
- **D-08:** MMK displayed with 0 decimal places (`Intl.NumberFormat` with `minimumFractionDigits: 0`). THB displayed with 2 decimal places. Create shared `formatCurrency(amount: number, currency: 'THB' | 'MMK')` utility.
- **D-09:** Exchange rate calculations: multiply amount in satang by rate, round to nearest pya, then convert for display. Never calculate with floating-point display values.

### Design Token Refinement
- **D-10:** Myanmar font: Noto Sans Myanmar UI loaded via `next/font/google` in root layout. NOT Padauk (requires Graphite rendering, only Firefox supports). NOT Noto Sans Myanmar (different weight set).
- **D-11:** Touch targets enforced at 44x44px minimum in design system. All interactive elements (buttons, links, nav items, form inputs) must meet this constraint.
- **D-12:** Dark text (#212121) on yellow (#FFE600) backgrounds — contrast ratio 14.7:1 (AAA). NEVER white text on yellow (1.07:1 contrast, fails all WCAG). Blue links (#0091EA) only on white/light backgrounds.

### Claude's Discretion
- Specific Supabase RLS policy structure — follow standard patterns from research
- Mock rejection reasons library content — Claude picks realistic banking rejection messages
- Exact spacing/shadow token values — use UI-UX-REVIEW.md recommendations
- Database column types and indexes — follow supabase-schema.sql as base, optimize as needed

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/UI-UX-REVIEW.md` — Full design token extraction, component inventory, accessibility audit, shadcn mapping
- `src/app/globals.css` — Current CSS custom properties and design tokens

### Database
- `.planning/supabase-schema.sql` — Database schema with RLS policies and indexes

### Research
- `.planning/research/STACK.md` — Stack recommendations including next-intl patterns, QR libraries, font choices
- `.planning/research/ARCHITECTURE.md` — Route group structure, server/client boundaries, mock service patterns
- `.planning/research/PITFALLS.md` — Critical pitfalls with prevention strategies and phase mapping
- `.planning/research/SUMMARY.md` — Synthesized research findings

### Project
- `.planning/PROJECT.md` — Project context, core value, constraints
- `.planning/REQUIREMENTS.md` — Phase 1 requirements (FOUN-01 through FOUN-08)
- `.planning/PRD-REFERENCE.md` — Detailed PRD with feature specs and architecture

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/layout/bottom-nav.tsx` — Bottom navigation with 4 tabs and yellow FAB
- `src/components/layout/top-header.tsx` — Brand header with yellow gradient
- `src/components/layout/back-header.tsx` — Sub-page header with back button
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server Supabase client with cookie handling
- `src/lib/supabase/middleware.ts` — Session refresh helper used in proxy.ts
- `src/types/index.ts` — TypeScript types for all domain entities
- `src/app/globals.css` — 25+ brand color tokens already defined
- 20 shadcn/ui components installed (button, card, input, dialog, drawer, etc.)

### Established Patterns
- Route groups: `(auth)/` for login/register, `(main)/` for authenticated pages with bottom nav
- Server Components default, `"use client"` for interactive components only
- proxy.ts handles auth session refresh on all routes
- Mock API routes at `/api/mock-kyc/` and `/api/mock-payment/` with configurable behavior

### Integration Points
- `src/app/layout.tsx` — Root layout where fonts and providers are added
- `next.config.ts` — Where next-intl plugin and other config goes
- `.env.local` — Mock service environment variables

</code_context>

<specifics>
## Specific Ideas

- The prototype uses a very specific yellow gradient for headers: `linear-gradient(180deg, #FFE600 0%, #FFF176 100%)` — this must be preserved
- Status bar area uses solid blue #0091EA — matches iOS status bar tint
- The 2C2P Wave logo uses specific letter styling: "2c2p" in bold black, "wave" in bold blue
- Bottom nav Add Money button is elevated above the bar as a yellow circular FAB with shadow

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-14*
