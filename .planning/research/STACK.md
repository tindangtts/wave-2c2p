# Technology Stack

**Project:** 2C2P Wave — Mobile Banking & Remittance PWA
**Researched:** 2026-04-14
**Stack basis:** Next.js 16.2.3 + Supabase + shadcn/ui already scaffolded and locked in

---

## Already Installed (Do Not Re-evaluate)

The project scaffold is live. These are confirmed installed via `package.json`:

| Package | Version | Status |
|---------|---------|--------|
| next | 16.2.3 | Locked |
| react / react-dom | 19.2.4 | Locked |
| @supabase/supabase-js | ^2.103.0 | Locked |
| @supabase/ssr | ^0.10.2 | Locked |
| tailwindcss | ^4 | Locked |
| shadcn | ^4.2.0 | Locked |
| next-intl | ^4.9.1 | Installed |
| react-hook-form | ^7.72.1 | Installed |
| @hookform/resolvers | ^5.2.2 | Installed |
| zod | ^4.3.6 | Installed |
| zustand | ^5.0.12 | Installed |
| date-fns | ^4.1.0 | Installed |
| embla-carousel-react | ^8.6.0 | Installed |
| input-otp | ^1.4.2 | Installed |
| lucide-react | ^1.8.0 | Installed |
| react-day-picker | ^9.14.0 | Installed |
| sonner | ^2.0.7 | Installed |
| vaul | ^1.1.2 | Installed |
| zustand | ^5.0.12 | Installed |

---

## Recommended Additions (Not Yet Installed)

### i18n: next-intl (already installed — usage patterns needed)

**Confidence: HIGH** — verified against next-intl.dev official docs and v4 release notes.

next-intl v4.9.1 is already installed. Key usage decisions:

**Use next-intl with locale-prefix routing.** The PRD specifies `/th`, `/en`, `/my` locale prefixes. Use the `[locale]` dynamic segment pattern with App Router:

```
app/
  [locale]/
    layout.tsx       ← NextIntlClientProvider here
    (auth)/
    (main)/
```

**Font loading is separate from i18n.** next-intl handles message strings only — it does NOT render scripts differently. Font selection must be driven by `lang` attribute on `<html>` combined with CSS `@font-face` targeting.

**Thai locale (`th-TH`):** Use `next/font/google` with `Noto_Sans_Thai`. The Buddhist calendar offset (+543 years) is handled automatically by `Intl.DateTimeFormat` when `locale = 'th-TH'` — next-intl's `format.dateTime()` delegates to this.

**Myanmar locale (`my-MM`):** Noto Sans Myanmar UI is the correct choice for app interfaces (vs Noto Sans Myanmar which is for documents). Load via `next/font/google`. Padauk requires Graphite rendering which only Firefox supports — do NOT use Padauk as a primary web font. Myanmar script requires OpenType shaping; modern browsers handle this correctly with Noto.

**v4 breaking changes to know:**
- ESM-only (except `next-intl/plugin`) — the plugin import in `next.config.ts` must use `createNextIntlPlugin` from `next-intl/plugin`
- `getRequestConfig` must now explicitly return `locale` — failing to do this throws at runtime
- `NextIntlClientProvider` automatically inherits server messages — do NOT manually pass `messages` prop unless overriding

**Locale cookie:** v4 defaults to session cookie (not persistent). This is correct for a banking app — do not override this back to persistent.

**NOT recommended:**
- `next-i18next` — Next.js Pages Router only, incompatible with App Router
- `react-i18next` alone — works but lacks the App Router server-side integration that next-intl provides out of the box
- i18n routing via `next.config.js` `i18n` key — this is Pages Router only, removed in App Router

---

### QR Code Generation: react-qr-code

**Confidence: HIGH** — multiple sources, actively maintained, UTF-8 byte mode confirmed.

**Use `react-qr-code` (rosskhanas/react-qr-code) for generation.**

```bash
npm install react-qr-code
```

Rationale:
- SVG output — scales perfectly on all screen densities, no pixelation on Retina/AMOLED
- UTF-8 byte mode — handles non-ASCII content (Thai phone numbers, Myanmar NRC numbers) correctly
- Zero heavy dependencies
- Simple React component API: `<QRCode value={data} size={256} />`
- Actively maintained (2025 releases)

For the "Add Money" QR payment flow, the QR value encodes the PromptPay/payment data as a string — react-qr-code handles this directly.

**NOT recommended:**
- `qr-code-styling` — adds logo/gradient styling complexity not needed for PromptPay standard QR codes; heavier
- `qrcode.react` — older library, less active
- `qrious` — non-React, canvas-based, worse on high-DPI screens

---

### QR Code Scanning: @yudiel/react-qr-scanner + file-input fallback

**Confidence: MEDIUM** — iOS PWA streaming limitation is documented and confirmed across multiple sources.

**Critical iOS PWA limitation:** Live camera streaming (getUserMedia) does NOT work inside iOS PWA standalone mode. This is a hard Apple platform restriction with no workaround — it works in Safari browser but not installed PWA mode. This affects the Scan tab fundamentally.

**Two-mode scanning strategy (required):**

**Mode 1 — Android/Browser (live stream):**
```bash
npm install @yudiel/react-qr-scanner
```
`@yudiel/react-qr-scanner` v2.x — actively maintained (last published ~3 months ago as of 2026-04), React component wrapper around the Barcode Detection API with MediaDevices fallback. Renders a `<video>` stream with overlay.

**Mode 2 — iOS PWA fallback (file input):**
```html
<input type="file" accept="image/*" capture="environment" />
```
When the user selects an image, pass it to `jsQR` or the Barcode Detection API to decode. This is the only approach that works in iOS PWA standalone mode.

**Detection logic:**
```typescript
const isIOSPWA = 
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  window.matchMedia('(display-mode: standalone)').matches;
```

Show live scanner on Android/browser, show file-input-based capture on iOS PWA.

**NOT recommended:**
- `html5-qrcode` — large bundle, outdated API surface
- `react-qr-scanner` (kybarg) — last published 3 years ago, documented iOS incompatibility
- Native Barcode Detection API alone — Safari does not support it on iOS

---

### Camera Access for Document Capture (eKYC): Native MediaDevices + `<input capture>`

**Confidence: HIGH** — this is native browser API, no library needed.

**Do NOT install a camera library for document capture.** Use native browser APIs directly:

```typescript
// For getUserMedia live video (document overlay):
navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'environment' } 
})

// For iOS PWA / file fallback:
<input type="file" accept="image/*" capture="environment" />
```

iOS-specific requirements:
- Add `playsInline` attribute to `<video>` — required for iOS Safari
- Chrome and Firefox on iOS use Safari's WebKit engine — all camera access goes through Safari
- Safari on iOS will re-prompt for camera permissions when navigating between routes — design the eKYC flow as a single-page sequence, not multi-route, to avoid repeated prompts

For the eKYC overlay (document frame guide, liveness circle), implement with pure CSS/SVG positioned over the `<video>` element. No library needed.

**NOT recommended:**
- `react-html5-camera-photo` — abandoned, last release 2021
- `react-webcam` — works but adds unnecessary abstraction over native APIs; creates issues with iOS PWA permission re-prompting

---

### Currency Formatting: Native Intl.NumberFormat (no library)

**Confidence: HIGH** — MDN documented, widely supported, zero-dependency.

**Use `Intl.NumberFormat` directly — do NOT install a currency formatting library.**

```typescript
// Thai Baht — shown to Thai users
const thbFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Myanmar Kyat — no fractional units
const mmkFormatter = new Intl.NumberFormat('my-MM', {
  style: 'currency',
  currency: 'MMK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// English fallback
const thbEnFormatter = new Intl.NumberFormat('en-TH', {
  style: 'currency',
  currency: 'THB',
});
```

**Cache formatter instances** — create once per locale/currency combination, reuse. Creating a new `Intl.NumberFormat` on every render is expensive.

MMK has no subunits (no fractional Kyat) — set `minimumFractionDigits: 0` explicitly or you'll show incorrect decimal places.

**NOT recommended:**
- `currency.js` — adds 5KB for functionality native Intl covers
- `numeral` — unmaintained since 2019
- `accounting.js` — abandoned, predates Intl standardization

---

### Form Validation: react-hook-form v7 + zod v4 (already installed)

**Confidence: HIGH** — verified against official docs and confirmed compatibility between installed versions.

Both are already installed. Critical compatibility note: **@hookform/resolvers v5.2.0+ is required for zod v4**. The installed version is ^5.2.2 which satisfies this. Zod v4 introduced breaking type changes that broke older resolvers — v5.2.2 handles zod v4, zod v4 mini, and maintains backward compat with zod v3.

**Standard pattern for this project:**

```typescript
// schemas/transfer.ts — shared schema, client + server
import { z } from 'zod'

export const transferSchema = z.object({
  amount: z.number().positive().max(500000),
  recipientId: z.string().uuid(),
  channel: z.enum(['WAVE_AGENT', 'WAVE_APP', 'CASH_PICKUP', 'BANK']),
})

export type TransferInput = z.infer<typeof transferSchema>
```

```typescript
// In client component
import { zodResolver } from '@hookform/resolvers/zod'
const form = useForm<TransferInput>({
  resolver: zodResolver(transferSchema),
})
```

Use the **same schema on the server** (in API routes or Server Actions) for defense-in-depth validation. Do not duplicate validation logic.

For multi-step registration and eKYC flows: use a single `useForm` instance across steps with `trigger()` for per-step field validation. Do NOT create separate form instances per step — state is lost between renders.

**NOT recommended:**
- Yup — works but zod is already installed and preferred for TypeScript projects
- Valibot — not yet in ecosystem, team unfamiliar
- formik — heavy, much slower than react-hook-form

---

### State Management: Zustand v5 (already installed)

**Confidence: HIGH** — Zustand v5 confirmed compatible with React 19 and Next.js App Router.

Zustand is already installed at v5.0.12. Key patterns for App Router:

**Use the Store Factory pattern for SSR safety.** A global Zustand store shared across SSR requests leaks User A's data to User B. The correct pattern:

```typescript
// stores/create-wallet-store.ts
import { createStore } from 'zustand/vanilla'

export const createWalletStore = (initState: WalletState) =>
  createStore<WalletState & WalletActions>()((set) => ({
    ...initState,
    setBalance: (balance) => set({ balance }),
  }))
```

Provide via React context in a Client Component that wraps the layout.

**State ownership split:**
- Zustand: UI state, user session cache, form multi-step state, wallet balance display
- Server state (SWR or direct fetch): transaction history, exchange rates, recipient list

**Do NOT use Zustand for server-fetched data** — use SWR for anything that needs revalidation, loading states, and cache invalidation.

**SWR over TanStack Query for this project:**
- SWR is 5.3KB vs TanStack Query 16.2KB — significant on 3G
- Next.js team maintains SWR; it integrates cleanly with App Router
- The project's data fetching needs (transaction polling, rate refresh) are well within SWR's capabilities
- TanStack Query's extra features (devtools, complex invalidation trees) are not needed here

```bash
npm install swr
```

**NOT recommended:**
- Redux Toolkit — massive overkill, 3x the bundle size
- Jotai — atomic model is harder to reason about for this team's use case
- TanStack Query — too heavy for the 3G performance target

---

### PWA Tooling: Serwist

**Confidence: HIGH** — Next.js 16 official docs reference Serwist; next-pwa is unmaintained.

`next-pwa` (shadowwalker) is effectively unmaintained and has known issues with Next.js 15+. **Use Serwist** — the maintained fork with active Next.js 16 support.

```bash
npm install @serwist/next
npm install -D serwist
```

Next.js has built-in manifest support via `app/manifest.ts` — no library needed for that part.

**Configuration:**
```typescript
// next.config.ts
import withSerwist from '@serwist/next'

const withSerwistConfig = withSerwist({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development', // CRITICAL: disable in dev
})

export default withSerwistConfig({ /* nextConfig */ })
```

**Caching strategy for this app:**
- App shell (HTML/CSS/JS): CacheFirst with versioning
- API routes (`/api/mock-*`): NetworkFirst — mock data should always be fresh
- Static assets (icons, fonts): CacheFirst with long TTL
- Do NOT cache Supabase API calls — authentication tokens expire

Set `reloadOnOnline: false` in the service worker — banking forms with half-filled data should not auto-reload when connectivity is restored.

**NOT recommended:**
- `next-pwa` (shadowwalker/next-pwa) — last meaningful update 2022, broken on Next.js 15+
- Manual Workbox setup — high complexity, Serwist wraps this correctly
- `next-offline` — abandoned

---

### Testing: Vitest + React Testing Library + Playwright

**Confidence: HIGH** — Next.js official docs recommend this exact combination for App Router projects.

Nothing is installed yet. Add:

```bash
# Unit + integration
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

# E2E
npm install -D @playwright/test
npx playwright install
```

**Vitest for unit/integration testing:**
- Supports ESM, TypeScript, JSX natively — no babel config
- async Server Components cannot be unit tested with Vitest (React limitation) — use Playwright for those
- Synchronous Server Components and all Client Components: test with Vitest + RTL

**Playwright for E2E:**
- Critical flows to cover: OTP login, multi-step registration, transfer confirmation, QR generation
- Run against `localhost:3000` in CI — no need for a separate test environment for mock services

**Testing boundaries for this project:**
| Layer | Tool | What to test |
|-------|------|-------------|
| Zod schemas | Vitest | All validation edge cases (phone formats, amount limits) |
| Form components | Vitest + RTL | Submission, error display, step navigation |
| Currency formatters | Vitest | THB/MMK formatting edge cases |
| Mock services | Vitest | API route response shapes |
| Auth flow | Playwright | OTP entry, session creation |
| Transfer flow | Playwright | Full remittance happy path |
| KYC flow | Playwright | Document capture, status polling |

**NOT recommended:**
- Jest — slower than Vitest for this stack (ESM transforms are painful)
- Cypress — heavier than Playwright, no multi-browser by default
- Testing real Supabase in unit tests — use a mock client

---

### Font Loading: next/font/google (no library)

**Confidence: HIGH** — built into Next.js, zero external requests at runtime.

```typescript
// app/[locale]/layout.tsx
import { Noto_Sans_Thai, Noto_Sans_Myanmar_UI, Noto_Sans } from 'next/font/google'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-thai',
})

const notoSansMyanmar = Noto_Sans_Myanmar_UI({
  subsets: ['myanmar'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-myanmar',
})
```

Apply via CSS `lang` targeting:
```css
:lang(th) { font-family: var(--font-thai), system-ui, sans-serif; }
:lang(my) { font-family: var(--font-myanmar), system-ui, sans-serif; }
```

**Use Noto Sans Myanmar UI (not Noto Sans Myanmar)** — the UI variant is optimized for small sizes and dense UI contexts. Noto Sans Myanmar is for document-style reading, proportions are wrong for form labels and navigation items.

**Do NOT use Padauk** as a web font primary. Padauk uses Graphite rendering for complex shaping — only Firefox supports Graphite. Chrome and Safari will fall back to basic rendering which shows incorrect Myanmar text. Noto Sans Myanmar UI uses OpenType exclusively, which all modern browsers support.

---

## Complete Additions Required

```bash
# QR generation
npm install react-qr-code

# QR scanning (live camera — Android/browser)
npm install @yudiel/react-qr-scanner

# Server state / data fetching
npm install swr

# PWA service worker
npm install @serwist/next
npm install -D serwist

# Testing — unit
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

# Testing — E2E
npm install -D @playwright/test
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| i18n | next-intl | next-i18next | Pages Router only |
| i18n | next-intl | react-i18next | No server-side App Router integration |
| QR generation | react-qr-code | qr-code-styling | Unnecessary visual complexity for PromptPay standard |
| QR scanning | @yudiel/react-qr-scanner | html5-qrcode | Large bundle, outdated |
| QR scanning | @yudiel/react-qr-scanner | react-qr-scanner (kybarg) | Abandoned 3 years ago, iOS broken |
| Currency | Intl.NumberFormat | currency.js | Native API covers all needs, 0KB cost |
| Currency | Intl.NumberFormat | numeral | Unmaintained since 2019 |
| PWA | Serwist | next-pwa | Unmaintained, broken on Next.js 15+ |
| Server state | SWR | TanStack Query | 3x bundle size, features not needed |
| Server state | SWR | Context + fetch | No caching, no deduplication |
| Testing | Vitest | Jest | Slow ESM transforms, worse TypeScript support |
| Testing | Playwright | Cypress | Heavier, single-browser by default |
| Myanmar font | Noto Sans Myanmar UI | Padauk | Graphite-only shaping, broken in Chrome/Safari |

---

## Critical Pitfall Callouts

**Zod v4 + @hookform/resolvers compatibility:** @hookform/resolvers v5.2.2 (installed) is confirmed compatible with zod v4. Do not downgrade zod to v3 — this breaks the resolver in the opposite direction. Both must stay in sync.

**iOS PWA QR streaming is impossible:** This is not a library limitation — it is an Apple platform restriction. The Scan tab MUST implement dual-mode: file input capture for iOS PWA, live stream for everything else. Do not promise live QR scanning in iOS installed mode.

**Service worker in development:** Serwist must be disabled in `NODE_ENV=development`. Failing to do this causes cached responses to serve stale code during development, creating impossible-to-debug behavior.

**Myanmar MMK fractional digits:** `Intl.NumberFormat` with `currency: 'MMK'` may default to 2 decimal places in some locales. Explicitly set `minimumFractionDigits: 0, maximumFractionDigits: 0` — Myanmar Kyat has no subunit.

**next-intl v4 ESM:** The package is ESM-only. If any bundler or test config uses CommonJS transforms without proper ESM interop, imports will fail. Vitest with `environment: 'jsdom'` requires explicit ESM support in `vite.config.ts`.

---

## Sources

- next-intl v4 release: https://next-intl.dev/blog/next-intl-4-0
- next-intl npm (v4.9.1 confirmed): https://www.npmjs.com/package/next-intl
- @hookform/resolvers zod v4 compat: https://github.com/react-hook-form/resolvers/releases
- Serwist Next.js docs: https://serwist.pages.dev/docs/next/getting-started
- Next.js PWA guide: https://nextjs.org/docs/app/guides/progressive-web-apps
- Vitest with Next.js: https://nextjs.org/docs/app/guides/testing/vitest
- iOS PWA camera limitation: https://dev.to/niscontractor/qr-code-integration-in-pwa-and-its-challenges-18o4
- Nimiq QR Scanner: https://github.com/nimiq/qr-scanner
- @yudiel/react-qr-scanner: https://www.npmjs.com/package/@yudiel/react-qr-scanner
- react-qr-code: https://github.com/rosskhanas/react-qr-code
- Noto Sans Myanmar UI: https://notofonts.github.io/noto-docs/specimen/NotoSansMyanmarUI/
- Intl.NumberFormat MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- Zustand v5 + Next.js App Router: https://www.technetexperts.com/nextjs-zustand-app-router-state/
- SWR vs TanStack Query 2025: https://refine.dev/blog/react-query-vs-tanstack-query-vs-swr-2025/
