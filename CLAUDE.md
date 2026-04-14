@AGENTS.md

# 2C2P Wave - Banking Mobile Web App

## Project Overview
Mobile-first banking and cross-border remittance PWA (Thailand ↔ Myanmar).
Built with Next.js 16 (App Router) + Supabase + shadcn/ui + Tailwind CSS v4.

## Tech Stack
- **Framework**: Next.js 16.2.3 (App Router, Server Components)
- **Database/Auth**: Supabase (Phone OTP auth, PostgreSQL, RLS, Storage)
- **UI**: shadcn/ui (base-nova style) + Tailwind CSS v4
- **State**: Zustand (client), React Hook Form + Zod (forms)
- **Icons**: Lucide React
- **Language**: TypeScript strict mode

## Project Structure
```
src/
├── app/(auth)/          # Login, register, KYC, passcode (no bottom nav)
├── app/(main)/          # Home, scan, add-money, transfer, etc (with bottom nav)
├── app/api/mock-kyc/    # Mock eKYC verification endpoints
├── app/api/mock-payment/# Mock payment processing endpoints
├── components/layout/   # BottomNav, TopHeader, BackHeader
├── components/features/ # WalletCard, QuickActions, RecentHistory, etc
├── components/ui/       # shadcn/ui components
├── lib/supabase/        # Supabase client/server/middleware helpers
├── types/               # TypeScript types
├── stores/              # Zustand stores
└── hooks/               # Custom React hooks
```

## Key Design Decisions
- **Mobile-first**: Max width 430px container centered in viewport
- **Next.js 16**: Uses `proxy.ts` instead of `middleware.ts`
- **Mock services**: eKYC and payment processing are mock APIs (configurable via env vars)
- **Design tokens**: Colors/spacing from Pencil prototype UI review in `.planning/UI-UX-REVIEW.md`
- **Brand colors**: Yellow #FFE600 (primary), Blue #0091EA (secondary), dark text #212121 on yellow backgrounds

## Commands
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
```

## Important Files
- `.planning/PROJECT.md` - Full PRD
- `.planning/ROADMAP.md` - 10-phase implementation plan
- `.planning/UI-UX-REVIEW.md` - Comprehensive UI/UX analysis from prototype
- `.planning/supabase-schema.sql` - Database schema
- `.env.local.example` - Required environment variables

<!-- GSD:project-start source:PROJECT.md -->
## Project

**2C2P Wave**

A mobile-first progressive web app for cross-border money transfers between Thailand (THB) and Myanmar (MMK). It serves migrant workers and individuals who need to send money home, manage digital wallets, complete eKYC verification, and access basic banking services through a simple, accessible mobile interface.

**Core Value:** Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance — the entire flow from registration through transfer must work reliably on low-end smartphones with spotty connectivity.

### Constraints

- **Tech Stack**: Next.js 16 + Supabase + shadcn/ui — already scaffolded, locked in
- **Mobile-first**: Max 430px container, touch targets 44x44px minimum, safe area handling
- **Mock Services**: eKYC and payment must be mock with configurable behavior via env vars
- **Accessibility**: WCAG 2.1 AA minimum, dark text on yellow backgrounds (contrast ratio)
- **Performance**: LCP < 2.5s on 3G, offline fallback pages
- **i18n**: Must support 3 languages with proper script rendering (Thai, Myanmar/Burmese)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Already Installed (Do Not Re-evaluate)
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
## Recommended Additions (Not Yet Installed)
### i18n: next-intl (already installed — usage patterns needed)
- ESM-only (except `next-intl/plugin`) — the plugin import in `next.config.ts` must use `createNextIntlPlugin` from `next-intl/plugin`
- `getRequestConfig` must now explicitly return `locale` — failing to do this throws at runtime
- `NextIntlClientProvider` automatically inherits server messages — do NOT manually pass `messages` prop unless overriding
- `next-i18next` — Next.js Pages Router only, incompatible with App Router
- `react-i18next` alone — works but lacks the App Router server-side integration that next-intl provides out of the box
- i18n routing via `next.config.js` `i18n` key — this is Pages Router only, removed in App Router
### QR Code Generation: react-qr-code
- SVG output — scales perfectly on all screen densities, no pixelation on Retina/AMOLED
- UTF-8 byte mode — handles non-ASCII content (Thai phone numbers, Myanmar NRC numbers) correctly
- Zero heavy dependencies
- Simple React component API: `<QRCode value={data} size={256} />`
- Actively maintained (2025 releases)
- `qr-code-styling` — adds logo/gradient styling complexity not needed for PromptPay standard QR codes; heavier
- `qrcode.react` — older library, less active
- `qrious` — non-React, canvas-based, worse on high-DPI screens
### QR Code Scanning: @yudiel/react-qr-scanner + file-input fallback
- `html5-qrcode` — large bundle, outdated API surface
- `react-qr-scanner` (kybarg) — last published 3 years ago, documented iOS incompatibility
- Native Barcode Detection API alone — Safari does not support it on iOS
### Camera Access for Document Capture (eKYC): Native MediaDevices + `<input capture>`
- Add `playsInline` attribute to `<video>` — required for iOS Safari
- Chrome and Firefox on iOS use Safari's WebKit engine — all camera access goes through Safari
- Safari on iOS will re-prompt for camera permissions when navigating between routes — design the eKYC flow as a single-page sequence, not multi-route, to avoid repeated prompts
- `react-html5-camera-photo` — abandoned, last release 2021
- `react-webcam` — works but adds unnecessary abstraction over native APIs; creates issues with iOS PWA permission re-prompting
### Currency Formatting: Native Intl.NumberFormat (no library)
- `currency.js` — adds 5KB for functionality native Intl covers
- `numeral` — unmaintained since 2019
- `accounting.js` — abandoned, predates Intl standardization
### Form Validation: react-hook-form v7 + zod v4 (already installed)
- Yup — works but zod is already installed and preferred for TypeScript projects
- Valibot — not yet in ecosystem, team unfamiliar
- formik — heavy, much slower than react-hook-form
### State Management: Zustand v5 (already installed)
- Zustand: UI state, user session cache, form multi-step state, wallet balance display
- Server state (SWR or direct fetch): transaction history, exchange rates, recipient list
- SWR is 5.3KB vs TanStack Query 16.2KB — significant on 3G
- Next.js team maintains SWR; it integrates cleanly with App Router
- The project's data fetching needs (transaction polling, rate refresh) are well within SWR's capabilities
- TanStack Query's extra features (devtools, complex invalidation trees) are not needed here
- Redux Toolkit — massive overkill, 3x the bundle size
- Jotai — atomic model is harder to reason about for this team's use case
- TanStack Query — too heavy for the 3G performance target
### PWA Tooling: Serwist
- App shell (HTML/CSS/JS): CacheFirst with versioning
- API routes (`/api/mock-*`): NetworkFirst — mock data should always be fresh
- Static assets (icons, fonts): CacheFirst with long TTL
- Do NOT cache Supabase API calls — authentication tokens expire
- `next-pwa` (shadowwalker/next-pwa) — last meaningful update 2022, broken on Next.js 15+
- Manual Workbox setup — high complexity, Serwist wraps this correctly
- `next-offline` — abandoned
### Testing: Vitest + React Testing Library + Playwright
# Unit + integration
# E2E
- Supports ESM, TypeScript, JSX natively — no babel config
- async Server Components cannot be unit tested with Vitest (React limitation) — use Playwright for those
- Synchronous Server Components and all Client Components: test with Vitest + RTL
- Critical flows to cover: OTP login, multi-step registration, transfer confirmation, QR generation
- Run against `localhost:3000` in CI — no need for a separate test environment for mock services
| Layer | Tool | What to test |
|-------|------|-------------|
| Zod schemas | Vitest | All validation edge cases (phone formats, amount limits) |
| Form components | Vitest + RTL | Submission, error display, step navigation |
| Currency formatters | Vitest | THB/MMK formatting edge cases |
| Mock services | Vitest | API route response shapes |
| Auth flow | Playwright | OTP entry, session creation |
| Transfer flow | Playwright | Full remittance happy path |
| KYC flow | Playwright | Document capture, status polling |
- Jest — slower than Vitest for this stack (ESM transforms are painful)
- Cypress — heavier than Playwright, no multi-browser by default
- Testing real Supabase in unit tests — use a mock client
### Font Loading: next/font/google (no library)
## Complete Additions Required
# QR generation
# QR scanning (live camera — Android/browser)
# Server state / data fetching
# PWA service worker
# Testing — unit
# Testing — E2E
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
## Critical Pitfall Callouts
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
