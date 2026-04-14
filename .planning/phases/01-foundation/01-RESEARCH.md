# Phase 1: Foundation - Research

**Researched:** 2026-04-14
**Domain:** Next.js 16 App Router + Supabase + next-intl v4 + Tailwind CSS v4 + shadcn/ui
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Cookie-based locale routing (NOT URL-prefix) — avoids route restructuring under `[locale]/`, keeps banking URLs clean without PII in paths. Set locale via cookie, read in proxy.ts.
- **D-02:** Message files structured as one JSON per locale per feature — `messages/en/home.json`, `messages/th/auth.json`, `messages/mm/transfer.json`. Keeps bundles small per page.
- **D-03:** next-intl v4 with `createNextIntlPlugin` in next.config.ts. `getRequestConfig` must explicitly return `locale`. `NextIntlClientProvider` inherits server messages automatically.
- **D-04:** Mock eKYC defaults to auto-approve after 1500ms delay. Override via `MOCK_KYC_AUTO_APPROVE=false` env var to test rejection flows. Rejection returns randomized reason from a library of 5 common reasons.
- **D-05:** Mock payment defaults to instant success with configurable delay via `MOCK_PAYMENT_DELAY_MS`. Status transitions: pending → processing → completed (or failed if `MOCK_PAYMENT_FAIL=true`).
- **D-06:** Mock exchange rate fixed at 58.148 THB→MMK, configurable via `MOCK_EXCHANGE_RATE_THB_MMK` env var. Rate endpoint returns current timestamp for "freshness" simulation.
- **D-07:** All financial calculations use integer arithmetic in smallest currency unit — satang for THB (1 THB = 100 satang), pya for MMK (1 MMK = 100 pya). Store as integers in DB, convert for display only.
- **D-08:** MMK displayed with 0 decimal places (`Intl.NumberFormat` with `minimumFractionDigits: 0`). THB displayed with 2 decimal places. Create shared `formatCurrency(amount: number, currency: 'THB' | 'MMK')` utility.
- **D-09:** Exchange rate calculations: multiply amount in satang by rate, round to nearest pya, then convert for display. Never calculate with floating-point display values.
- **D-10:** Myanmar font: Noto Sans Myanmar UI loaded via `next/font/google` in root layout. NOT Padauk. NOT Noto Sans Myanmar.
- **D-11:** Touch targets enforced at 44x44px minimum in design system.
- **D-12:** Dark text (#212121) on yellow (#FFE600) backgrounds only. NEVER white text on yellow.

### Claude's Discretion

- Specific Supabase RLS policy structure — follow standard patterns from research
- Mock rejection reasons library content — Claude picks realistic banking rejection messages
- Exact spacing/shadow token values — use UI-UX-REVIEW.md recommendations
- Database column types and indexes — follow supabase-schema.sql as base, optimize as needed

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUN-01 | App renders in mobile-first container (max 430px) with safe area handling | Root layout already has `max-w-[430px]` container; safe-top/safe-bottom utilities exist in globals.css; `env(safe-area-inset-*)` patterns documented |
| FOUN-02 | Design system tokens (colors, typography, spacing, shadows) match prototype brand identity | globals.css already has full token set; UI-SPEC defines exact values; gaps identified (typography tokens missing, radius tokens relative not absolute) |
| FOUN-03 | shadcn/ui components themed with 2C2P Wave yellow/blue palette | `--primary: #FFE600`, `--primary-foreground: #212121` already set; Badge variants need success/warning/info additions; font-myanmar is wrong (Padauk) |
| FOUN-04 | Supabase database schema deployed with RLS enabled on all tables | supabase-schema.sql is complete; critical schema bug found: wallet balance uses `numeric(12,2)` but D-07 mandates integer satang storage — must fix to `bigint` |
| FOUN-05 | i18n infrastructure supports English, Thai, and Myanmar with correct font loading | next-intl v4.9.1 installed; cookie-based routing requires `localePrefix: 'never'` in routing config; `i18n/request.ts` must return explicit `locale`; messages/ dir does not exist yet |
| FOUN-06 | Mock eKYC API endpoints respond with configurable pass/fail behavior via env vars | Routes exist but don't read env vars yet — `MOCK_KYC_AUTO_APPROVE` is hardcoded; need env-var-driven behavior per D-04 |
| FOUN-07 | Mock payment API endpoints provide exchange rates, fee calculation, and transfer processing | Routes exist but `MOCK_EXCHANGE_RATE_THB_MMK` and `MOCK_PAYMENT_DELAY_MS` env vars are not read — hardcoded 58.148 and 2000ms |
| FOUN-08 | Currency calculations use integer arithmetic (satang/pya) to avoid floating-point errors | No `formatCurrency` utility exists; types.ts uses `number` for amounts with no satang convention; process-transfer route computes `amount * exchangeRate` in floats |
</phase_requirements>

---

## Summary

Phase 1 hardens an already-scaffolded Next.js 16 project into a production-ready foundation. The scaffold (16 routes, 20 shadcn components, Supabase clients, mock API routes, CSS design tokens) is confirmed present and functional. The work is gap-filling and correctness-fixing, not greenfield construction.

Four significant gaps require attention before downstream phases can build on this foundation safely. First, the Supabase schema stores wallet balances and transaction amounts as `numeric(12,2)` float-friendly columns, directly contradicting D-07's requirement for integer satang storage — this must be corrected at schema creation time, not as a later migration. Second, the mock API routes hard-code the values that D-04 through D-06 require to be env-var configurable. Third, the i18n infrastructure has no message files, no `i18n/request.ts`, and no next-intl plugin wired into `next.config.ts`. Fourth, the root layout still loads Geist font and references Padauk/`Noto Sans Myanmar` (wrong variant) instead of `Noto_Sans_Thai` and `Noto_Sans_Myanmar_UI`.

The design token system in globals.css is largely complete for colors and shadows but missing explicit typography CSS custom properties (`--text-display`, `--text-heading`, `--text-body`, `--text-caption`) and the absolute pixel radius values the UI-SPEC specifies (current values are relative `calc(var(--radius) * X)` which can drift).

**Primary recommendation:** Execute Phase 1 as five discrete task streams — schema fix + RLS, mock service env-var wiring, i18n infrastructure, font loading + token completion, and currency utility. Each can be done and verified independently without blocking the others.

---

## Standard Stack

### Core (Already Installed — Do Not Re-evaluate)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| next | 16.2.3 | App Router framework | Locked |
| react / react-dom | 19.2.4 | UI rendering | Locked |
| @supabase/supabase-js | ^2.103.0 | Database, Auth, Realtime | Locked |
| @supabase/ssr | ^0.10.2 | SSR-safe Supabase client | Locked |
| tailwindcss | ^4 | Utility CSS | Locked |
| next-intl | 4.9.1 | i18n (installed, NOT yet wired) | Installed, needs config |
| zod | ^4.3.6 | Schema validation | Installed |
| react-hook-form | ^7.72.1 | Form state | Installed |
| zustand | ^5.0.12 | Client state | Installed |
| lucide-react | ^1.8.0 | Icons | Installed |
| sonner | ^2.0.7 | Toast notifications | Installed |

### Phase 1 Specific — No New Packages Required

All packages needed for Phase 1 are already installed. No `npm install` commands are needed.

---

## Architecture Patterns

### next-intl v4 Cookie-Based Locale (No URL Prefix)

D-01 mandates cookie-based locale routing without URL prefix. next-intl v4.9.1 supports this via `localePrefix: 'never'`.

**Verified pattern** (from next-intl v4.9.1 dist types — `LocalePrefixMode = 'always' | 'as-needed' | 'never'`):

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'th', 'mm'],
  defaultLocale: 'en',
  localePrefix: 'never',  // No /en/, /th/, /mm/ URL prefix
  localeCookie: {
    name: 'locale',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  },
})
```

**CRITICAL — getRequestConfig must return explicit locale (D-03):**

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Validate locale — fall back to default if invalid or undefined
  if (!locale || !routing.locales.includes(locale as 'en' | 'th' | 'mm')) {
    locale = routing.defaultLocale
  }

  return {
    locale,  // REQUIRED in v4 — omitting this throws at runtime
    messages: (await import(`../../messages/${locale}/common.json`)).default,
  }
})
```

**next.config.ts wiring (D-03):**

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {}
export default withNextIntl(nextConfig)
```

**proxy.ts integration for cookie locale detection:**

The existing `src/proxy.ts` calls `updateSession` only. Add next-intl middleware composing after session refresh:

```typescript
// src/proxy.ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session first (Pitfall 11 — single token refresh at edge)
  const sessionResponse = await updateSession(request)
  if (sessionResponse.status !== 200 && sessionResponse.headers.get('location')) {
    return sessionResponse // redirect from auth guard
  }
  // 2. Apply intl locale cookie detection
  return intlMiddleware(request)
}
```

**Note:** With `localePrefix: 'never'`, routes do NOT need to be nested under `app/[locale]/`. The locale is read from the cookie in `getRequestConfig`. This avoids the route restructuring that the Next.js built-in i18n guide describes.

### Message File Structure (D-02)

```
messages/
├── en/
│   ├── common.json      # App name, error messages, nav labels, status labels
│   ├── auth.json        # Login, OTP, registration copy
│   ├── home.json        # Dashboard, wallet, quick actions
│   └── transfer.json    # Transfer flow copy
├── th/
│   ├── common.json
│   ├── auth.json
│   └── ...
└── mm/
    ├── common.json
    └── ...
```

Phase 1 only creates `common.json` per locale (the copywriting contract from UI-SPEC). Feature-specific files are created by subsequent phases.

### Font Loading Pattern (D-10, FOUN-05)

```typescript
// src/app/layout.tsx — replace Geist with project fonts
import { Noto_Sans_Thai, Noto_Sans_Myanmar_UI } from 'next/font/google'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-thai',
  preload: true,
})

const notoSansMyanmarUI = Noto_Sans_Myanmar_UI({
  subsets: ['myanmar'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-myanmar',
  preload: true, // Pitfall 18 — preload even if initial locale is EN/TH
})
```

Apply in `<html>` className: `${notoSansThai.variable} ${notoSansMyanmarUI.variable}`

Add to globals.css:
```css
:lang(th) { font-family: var(--font-thai), system-ui, -apple-system, sans-serif; }
:lang(my) { font-family: var(--font-myanmar), system-ui, sans-serif; }
```

The `<html lang="...">` attribute must be set from the cookie-based locale on every render to enable `:lang()` CSS selector.

### Currency Utility Pattern (D-07, D-08, D-09, FOUN-08)

```typescript
// src/lib/currency.ts
/**
 * Format an integer amount in smallest unit (satang/pya) for display.
 * THB: satang → baht (divide by 100, 2 decimal places)
 * MMK: pya → kyat (divide by 100, 0 decimal places)
 */
export function formatCurrency(amountInSmallestUnit: number, currency: 'THB' | 'MMK'): string {
  if (currency === 'THB') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInSmallestUnit / 100) // satang → baht
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInSmallestUnit / 100) // pya → kyat
}

/**
 * Convert THB satang to MMK pya using integer arithmetic.
 * rate: kyat per baht (e.g. 58.148 — store as integer scaled: 58148 / 1000)
 */
export function convertSatangToPya(satang: number, rateKyatPerBaht: number): number {
  // D-09: multiply satang by rate, round to nearest pya
  // satang / 100 gives baht; baht * rate gives kyat; kyat * 100 gives pya
  return Math.round((satang * rateKyatPerBaht) / 100)
}
```

**NEVER use `parseFloat()` in financial logic.** All amounts entering any calculation path must be integers in smallest unit.

### Mock Service Env-Var Pattern (D-04, D-05, D-06)

All mock routes must read env vars at request time (not module load time):

```typescript
// Pattern for mock KYC verify-document route
const autoApprove = process.env.MOCK_KYC_AUTO_APPROVE !== 'false' // default: true
const delayMs = parseInt(process.env.MOCK_KYC_DELAY_MS ?? '1500', 10)
const exchangeRate = parseFloat(process.env.MOCK_EXCHANGE_RATE_THB_MMK ?? '58.148')
const paymentFail = process.env.MOCK_PAYMENT_FAIL === 'true' // default: false
```

**Pitfall 15 guard** — mock flags must default to safe behavior:
- `MOCK_KYC_AUTO_APPROVE`: default `true` (dev-friendly), validate in production: `if (process.env.NODE_ENV === 'production' && autoApprove) throw new Error(...)`
- `MOCK_PAYMENT_FAIL`: default `false` (safe default)

### Supabase Schema Fix (FOUN-04, D-07)

The existing `supabase-schema.sql` uses `numeric(12,2)` for monetary columns. D-07 requires integer satang storage.

**Required column type changes:**
```sql
-- wallets.balance: numeric(12,2) → bigint (satang, e.g. 1000000 = 10,000 THB)
-- wallets.max_topup: numeric(12,2) → bigint (satang)
-- transactions.amount: numeric(12,2) → bigint (satang)
-- transactions.converted_amount: numeric(12,2) → bigint (pya)
-- transactions.fee: numeric(8,2) → bigint (satang)
-- transactions.exchange_rate: numeric(10,4) → numeric(10,4) KEEP (rate is not a currency amount)
-- cards.balance: numeric(12,2) → bigint (satang)
-- referrals.reward_amount: numeric(8,2) → bigint (satang)
```

**Also required — missing INSERT policy on user_profiles:**
```sql
-- Schema lacks a policy for initial profile creation at registration
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);
```

**Wallet balance UPDATE policy missing:**
```sql
-- Schema lacks server-side balance update policy (service role bypasses RLS, but explicit is safer)
create policy "Service role can update wallet balance" on public.wallets
  for update using (true); -- Restrict to service role via Supabase policy settings
```

**Pitfall 2 compliance** — RLS policies use only `auth.uid()`, never `user_metadata`. Verified in schema: all policies use `auth.uid() = id` or `auth.uid() = user_id`. Compliant.

### globals.css Token Gaps to Fill

Existing globals.css already has: brand colors, semantic colors, shadows, layout variables, z-index scale, gradient utilities.

**Missing tokens that UI-SPEC requires:**

```css
:root {
  /* Typography scale tokens */
  --text-display: 1.75rem;   /* 28px, weight 700 */
  --text-heading: 1.25rem;   /* 20px, weight 700 */
  --text-body: 1rem;         /* 16px, weight 400 */
  --text-caption: 0.75rem;   /* 12px, weight 400, letter-spacing 0.08em */

  /* Absolute radius tokens (UI-SPEC values, not relative calc) */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Status bar area */
  --status-bar-height: 44px;
}
```

**Current globals.css bug:** `--font-family-myanmar: 'Padauk', 'Noto Sans Myanmar', sans-serif` — both fonts are wrong per D-10. Must be replaced with CSS variable `var(--font-myanmar)` pointing to `Noto_Sans_Myanmar_UI`.

### bottom-nav.tsx Accessibility Gap

Current bottom-nav.tsx is missing:
- `role="navigation" aria-label="Main"` on the `<nav>` element
- `aria-current="page"` on the active tab link
- Icon-only FAB lacks `aria-label`

The FAB label text renders as `"Add Money"` but no `aria-label` exists on the outer `<Link>`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie locale detection | Custom cookie parser in proxy.ts | `createMiddleware` from `next-intl/middleware` with `localePrefix: 'never'` | next-intl v4 handles cookie read/write, locale negotiation, and header setting automatically |
| Currency formatting | Custom number formatter | `Intl.NumberFormat` (native) | Already handles THB/MMK locale, grouping separators, and currency symbols |
| Font loading | `<link rel="preload">` tags manually | `next/font/google` | Automatic subset optimization, preload injection, CSS variable output |
| Supabase session refresh | Manual JWT handling | `updateSession` from `@/lib/supabase/middleware` (already exists) | Handles race condition (Pitfall 11), sets cookies correctly for SSR |
| Myanmar font check | Zawgyi detection logic | CSS `:lang(my)` + explicit `font-family: var(--font-myanmar)` on Myanmar text containers | Forces Noto Sans Myanmar UI over any system Zawgyi font |
| RLS policies | Custom authorization middleware | Supabase RLS on all tables | Server-enforced, impossible to bypass from client |

---

## Common Pitfalls

### Pitfall A: next-intl without `localePrefix: 'never'` adds URL prefixes
**What goes wrong:** Default `localePrefix: 'always'` forces all routes to `/en/home`, `/th/home` etc. The project decided against this (D-01) to keep URLs clean.
**How to avoid:** Explicitly set `localePrefix: 'never'` in `defineRouting()`. Locale is read from cookie only.
**Warning signs:** Any redirect to `/en/...` routes appearing in the browser.

### Pitfall B: `getRequestConfig` missing explicit `locale` return
**What goes wrong:** next-intl v4 throws a runtime error if `locale` is not in the return value of `getRequestConfig`. This is a breaking change from v3.
**How to avoid:** Always return `{ locale, messages: {...} }` — never return just `{ messages: {...} }`.
**Source:** Verified in `node_modules/next-intl/dist/types/server/react-server/getRequestConfig.d.ts` — `RequestConfig` type requires `locale: IntlConfig['locale']`.

### Pitfall C: Supabase schema numeric(12,2) vs bigint mismatch
**What goes wrong:** The schema file uses `numeric(12,2)` for all monetary columns. If deployed as-is and Phase 1 declares integer satang convention, all downstream phases will write satang integers to a column expecting decimal values — off by 100x display errors.
**How to avoid:** Fix schema before first deployment. Change monetary amount columns to `bigint`. The schema has not been deployed yet (project is at 0% progress), so this is a safe migration-free fix.

### Pitfall D: proxy.ts not composing intl middleware with Supabase session
**What goes wrong:** If next-intl middleware runs before `updateSession`, the locale cookie may be set but the Supabase session cookie is not refreshed. If `updateSession` returns a redirect, intl middleware never runs and locale cookie is not set.
**How to avoid:** Run `updateSession` first, check for redirect, then apply intl middleware. See Architecture Patterns section for composing pattern.

### Pitfall E: Wrong Myanmar font variant
**What goes wrong:** globals.css currently references `Padauk` and `Noto Sans Myanmar` — both incorrect per D-10. Padauk requires Graphite rendering (only Firefox supports it). `Noto Sans Myanmar` has a different weight set than `Noto Sans Myanmar UI`. Using either causes broken Myanmar text rendering in Chrome/Safari.
**How to avoid:** Load `Noto_Sans_Myanmar_UI` via `next/font/google` with `weight: ['400', '700']`. Replace the globals.css `--font-family-myanmar` entry.

### Pitfall F: Mock service flags defaulting to `true` in production
**What goes wrong:** Current `.env.local.example` has `MOCK_KYC_AUTO_APPROVE=true`. If production deployment doesn't set this var, the default string resolution `process.env.MOCK_KYC_AUTO_APPROVE !== 'false'` evaluates to `true` (undefined !== 'false'). All production KYC auto-approves.
**How to avoid:** Add a startup check in mock routes: if `NODE_ENV === 'production'` and auto-approve is enabled, log a critical error. Better: default mock behavior to `false` and require explicit `true` in dev `.env.local`.

### Pitfall G: `<html lang="...">` not set from cookie locale
**What goes wrong:** The root layout currently has `<html lang="en">` hardcoded. CSS `:lang(my)` and `:lang(th)` selectors never activate regardless of which locale the user has selected. Myanmar text always renders with the Latin fallback font.
**How to avoid:** Read the locale cookie in the root layout's server component and pass it to `<html lang={locale}>`. This is possible without `[locale]` URL segments when using next-intl's `getLocale()` server function.

---

## Code Examples

### Reading locale in root layout (cookie-based, no URL segment)

```typescript
// src/app/layout.tsx
import { getLocale } from 'next-intl/server'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} className={`${notoSansThai.variable} ${notoSansMyanmarUI.variable} h-full antialiased`}>
      <head>
        <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
      </head>
      <body>...</body>
    </html>
  )
}
```

### Badge variant additions for status indicators

```typescript
// Extend shadcn Badge variants in src/components/ui/badge.tsx
// Add to badgeVariants:
success: "bg-[#E8F5E9] text-[#212121] border-transparent",
warning: "bg-[#FFF3E0] text-[#212121] border-transparent",
info: "bg-[#E1F5FE] text-[#212121] border-transparent",
```

### mock-kyc env-var pattern (D-04)

```typescript
// src/app/api/mock-kyc/verify-document/route.ts
export async function POST(request: Request) {
  const body = await request.json()

  const autoApprove = process.env.MOCK_KYC_AUTO_APPROVE !== 'false'
  const delayMs = parseInt(process.env.MOCK_KYC_DELAY_MS ?? '1500', 10)

  await new Promise((resolve) => setTimeout(resolve, delayMs))

  if (!autoApprove) {
    const reasons = [
      'Document is blurry or unreadable.',
      'Document is expired.',
      'Name on document does not match registration.',
      'Document type not accepted.',
      'Photo unclear or face not visible.',
    ]
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    return NextResponse.json({ success: false, status: 'rejected', rejection_reason: reason })
  }
  // ... approved response
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 | File rename only — same API. AGENTS.md warns: "This is NOT the Next.js you know." |
| `i18n` key in `next.config.js` (Pages Router) | `createNextIntlPlugin` wrapper | App Router era | The `i18n` config key is Pages Router only — will silently do nothing in App Router |
| next-intl v3: `getRequestConfig` without `locale` | v4: `locale` is required in return value | next-intl v4.0 | Runtime error if omitted — verified in type definitions |
| `localePrefix: 'always'` (default) | `localePrefix: 'never'` for cookie routing | next-intl v3+ | Enables URL-prefix-free i18n |
| Storing amounts as `DECIMAL`/`FLOAT` | `bigint` in smallest unit | Industry best practice | Eliminates IEEE 754 floating-point errors in financial calculations |

---

## Open Questions

1. **next-intl + Supabase middleware composition order**
   - What we know: `updateSession` must run first to avoid race conditions; intl middleware must also run to set locale cookie
   - What's unclear: Whether next-intl's `createMiddleware` with `localePrefix: 'never'` is compatible with a custom `proxy` function that conditionally returns early (for auth redirects)
   - Recommendation: Test composition pattern in Wave 0; if conflicts arise, read locale cookie manually in `getRequestConfig` instead of using intl middleware

2. **`getLocale()` availability without `[locale]` URL segment**
   - What we know: next-intl's `getLocale()` reads from the cookie when `localePrefix: 'never'` is configured
   - What's unclear: Whether this works in the root layout without any `[locale]` parent segment
   - Recommendation: Implement and verify; fallback is to read `cookies().get('locale')` directly in the root layout

3. **Supabase schema migration vs. fresh creation**
   - What we know: `supabase-schema.sql` has never been deployed (0% project progress)
   - What's unclear: Whether the project has a Supabase project URL configured in `.env.local` already
   - Recommendation: Check for live Supabase project before attempting schema migration; if none, treat as fresh creation with corrected types

---

## Environment Availability

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| Supabase project (remote) | FOUN-04 schema deployment | Unknown | `.env.local` not present — `NEXT_PUBLIC_SUPABASE_URL` not confirmed |
| Node.js | Dev server | Available | Project scaffolded, `npm run dev` confirmed in git history |
| next-intl 4.9.1 | FOUN-05 | Available | Installed in `node_modules` |
| Noto_Sans_Myanmar_UI (Google Fonts) | FOUN-05 | Downloadable | Loaded via `next/font/google` at build time |
| Noto_Sans_Thai (Google Fonts) | FOUN-05 | Downloadable | Loaded via `next/font/google` at build time |

**Supabase availability note:** Schema deployment (FOUN-04) requires a Supabase project URL and service role key. If `.env.local` is not configured, schema deployment must be marked as a manual step. The plan should include a verification step to confirm `.env.local` is populated before attempting migration.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (not yet installed — Wave 0 gap) |
| Config file | `vitest.config.ts` — Wave 0 creates this |
| Quick run command | `npx vitest run --reporter=dot` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | Container max-width 430px renders | smoke | `npx vitest run tests/layout.test.tsx` | Wave 0 |
| FOUN-02 | CSS custom properties present in globals.css | unit | `npx vitest run tests/design-tokens.test.ts` | Wave 0 |
| FOUN-03 | shadcn Button default variant uses #FFE600 background | unit | `npx vitest run tests/components/button.test.tsx` | Wave 0 |
| FOUN-04 | RLS rejects unauthorized wallet reads | manual | Supabase SQL check: `SELECT rowsecurity FROM pg_tables WHERE tablename='wallets'` | N/A |
| FOUN-05 | Language switcher cycles EN→TH→MM | unit | `npx vitest run tests/i18n.test.ts` | Wave 0 |
| FOUN-06 | Mock KYC returns rejection when MOCK_KYC_AUTO_APPROVE=false | unit | `npx vitest run tests/api/mock-kyc.test.ts` | Wave 0 |
| FOUN-07 | Mock payment reads MOCK_EXCHANGE_RATE_THB_MMK env var | unit | `npx vitest run tests/api/mock-payment.test.ts` | Wave 0 |
| FOUN-08 | formatCurrency(100, 'THB') returns "฿1.00" | unit | `npx vitest run tests/lib/currency.test.ts` | Wave 0 |
| FOUN-08 | convertSatangToPya is associative (no float drift) | unit | `npx vitest run tests/lib/currency.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/lib/ tests/api/` (fast — pure function tests only)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom` — install
- [ ] `vitest.config.ts` — create with jsdom environment, path aliases matching `tsconfig.json`
- [ ] `tests/lib/currency.test.ts` — covers FOUN-08
- [ ] `tests/api/mock-kyc.test.ts` — covers FOUN-06
- [ ] `tests/api/mock-payment.test.ts` — covers FOUN-07
- [ ] `tests/i18n.test.ts` — covers FOUN-05 locale switching
- [ ] `tests/design-tokens.test.ts` — covers FOUN-02 token presence check

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 1 |
|-----------|-------------------|
| Next.js 16 with `proxy.ts` (not `middleware.ts`) | All routing/session logic goes in `src/proxy.ts` |
| Mock services must be configurable via env vars | Mock routes must read `process.env.*` not hardcoded values |
| shadcn official registry only — `registries: {}` | No third-party component registries |
| `next/font/google` for fonts — no library | Font loading is built-in Next.js only |
| Mobile-first max 430px container | Root layout container constraint must be preserved |
| Tailwind CSS v4 locked | No Tailwind v3 config patterns (`tailwind.config.js`) |
| TypeScript strict mode | All new files must compile with no `any` types in critical paths |
| No direct repo edits outside GSD workflow | Planning-driven execution only |
| AGENTS.md: Read `node_modules/next/dist/docs/` before writing code | Docs confirmed read — `proxy.ts` convention verified, i18n patterns verified |

---

## Sources

### Primary (HIGH confidence)

- `node_modules/next/dist/docs/01-app/02-guides/internationalization.md` — confirmed `proxy.ts` is the correct filename (not `middleware.ts`) in Next.js 16; cookie-based routing pattern via `localePrefix: 'never'`
- `node_modules/next-intl/dist/types/server/react-server/getRequestConfig.d.ts` — confirmed `locale` is required field in `RequestConfig` return type (v4 breaking change from v3)
- `node_modules/next-intl/dist/types/routing/config.d.ts` — confirmed `localePrefix` accepts `'never'` mode; `localeCookie` is a configurable attribute
- `node_modules/next-intl/dist/types/routing/types.d.ts` — confirmed `LocalePrefixMode = 'always' | 'as-needed' | 'never'`
- `src/app/globals.css` — direct inspection of existing token state; confirms shadows, brand colors, layout vars present; confirms wrong Myanmar font family
- `.planning/supabase-schema.sql` — direct inspection confirms `numeric(12,2)` for monetary columns; RLS enabled on all 7 tables; missing INSERT policy for user_profiles
- `src/proxy.ts` — confirms proxy function name and Supabase session update flow
- `src/app/api/mock-kyc/verify-document/route.ts`, `src/app/api/mock-payment/` — confirms hardcoded values not reading env vars
- `.planning/phases/01-foundation/01-CONTEXT.md` — all locked decisions D-01 through D-12
- `.planning/phases/01-foundation/01-UI-SPEC.md` — complete token values, component contracts, font loading contract
- `.planning/research/PITFALLS.md` — 19 domain pitfalls with phase mapping

### Secondary (MEDIUM confidence)

- `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md` — manifest pattern for `app/manifest.ts`; confirms `MetadataRoute.Manifest` type
- CLAUDE.md + AGENTS.md — project-specific constraints verified against implementation

### Tertiary (LOW confidence — informational only)

- None required. All critical claims for this phase verified from source files and bundled docs.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified from node_modules
- Architecture (next-intl cookie routing): HIGH — verified from next-intl v4.9.1 type definitions
- Schema fix (bigint): HIGH — direct inspection of supabase-schema.sql vs CONTEXT.md D-07
- Pitfalls: HIGH — sourced from project PITFALLS.md (prior research) and direct code inspection
- Validation architecture: MEDIUM — Vitest not yet installed; test patterns are standard but not yet verified against the project

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable stack — next-intl, Next.js, Supabase APIs are not fast-moving at this version)
