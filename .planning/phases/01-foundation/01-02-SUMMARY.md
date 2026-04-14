---
phase: 01-foundation
plan: 02
subsystem: i18n
tags: [next-intl, i18n, locale, cookie-routing, middleware]
dependency_graph:
  requires: [01-01]
  provides: [i18n-infrastructure, locale-aware-layout, message-files]
  affects: [all-future-plans-using-UI-copy]
tech_stack:
  added: []
  patterns: [cookie-based-locale-routing, next-intl-middleware-composition, server-component-locale-detection]
key_files:
  created:
    - src/i18n/routing.ts
    - src/i18n/request.ts
    - messages/en/common.json
    - messages/th/common.json
    - messages/mm/common.json
  modified:
    - next.config.ts
    - src/proxy.ts
    - src/app/layout.tsx
decisions:
  - "D-01 implemented: localePrefix:'never' with cookie-based locale detection — no URL restructuring needed"
  - "D-03 implemented: createNextIntlPlugin in next.config.ts, getRequestConfig returns explicit locale"
  - "messages/messages pass via NextIntlClientProvider root provider (load-bearing explicit pass for client components)"
  - "Session-first middleware composition: updateSession before intlMiddleware to preserve auth redirects"
metrics:
  duration: 5 minutes
  completed: "2026-04-14"
  tasks: 2
  files: 8
---

# Phase 01 Plan 02: i18n Infrastructure (next-intl v4) Summary

**One-liner:** Cookie-based next-intl v4 with localePrefix:'never', EN/TH/MM message files, and session-aware middleware composition.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create i18n routing config, request config, message files, wire next.config.ts | 4b8b96e | src/i18n/routing.ts, src/i18n/request.ts, next.config.ts, messages/*/common.json |
| 2 | Compose intl middleware in proxy.ts and make root layout locale-aware | f5692d6 | src/proxy.ts, src/app/layout.tsx |

## What Was Built

### next-intl v4 Infrastructure

The complete i18n backbone is now wired:

1. **`src/i18n/routing.ts`** — Defines locales `['en', 'th', 'mm']`, `localePrefix: 'never'` (cookie-based, no URL prefix per D-01), and a 1-year `locale` cookie with `sameSite: 'lax'`.

2. **`src/i18n/request.ts`** — `getRequestConfig` reads `requestLocale`, validates it against the allowed list, falls back to `'en'`, and returns the **explicit `locale`** field (required in v4 — omitting it throws at runtime).

3. **`next.config.ts`** — Wrapped with `withNextIntl(createNextIntlPlugin('./src/i18n/request.ts'))`.

4. **Message files** — Three locale directories created under `messages/`:
   - `messages/en/common.json` — English: appName, loading, error, empty, maintenance, session, language, nav
   - `messages/th/common.json` — Thai translations with full script (Thai: กำลังโหลด, หน้าหลัก, etc.)
   - `messages/mm/common.json` — Myanmar/Burmese translations (ပင်မ, စကင်န်, ငွေဖြည့်, etc.)

### Middleware Composition

`src/proxy.ts` now composes two middleware layers in the correct order (per Pitfall D from research):
1. `updateSession(request)` — Supabase session refresh runs first
2. If session returns a redirect (auth guard), that redirect is honored and intl never runs
3. `intlMiddleware(request)` — next-intl cookie locale detection runs second

### Locale-Aware Root Layout

`src/app/layout.tsx` is now an async Server Component:
- Reads locale via `getLocale()` from `next-intl/server`
- Sets `<html lang={locale}>` dynamically (was hardcoded `'en'`)
- Wraps children in `NextIntlClientProvider` with `messages` loaded via `getMessages()` — load-bearing explicit pass for all client components below the root provider boundary

## Verification Results

All acceptance criteria met:

```
grep "createNextIntlPlugin" next.config.ts        → MATCH
grep "localePrefix.*never" src/i18n/routing.ts    → MATCH
grep "locale," src/i18n/request.ts                → MATCH
grep "createMiddleware" src/proxy.ts              → MATCH
grep "intlMiddleware" src/proxy.ts                → MATCH
grep "updateSession" src/proxy.ts                 → MATCH
grep "getLocale" src/app/layout.tsx               → MATCH
grep 'lang={locale}' src/app/layout.tsx           → MATCH
grep 'lang="en"' src/app/layout.tsx               → NO MATCH (removed)
messages/en/common.json → valid JSON, contains "appName"
messages/th/common.json → valid JSON, nav.home = "หน้าหลัก"
messages/mm/common.json → valid JSON, nav.home = "ပင်မ"
npm run build → SUCCESS (18 pages, 0 errors)
```

## Deviations from Plan

### Note: D-10 Font Deviation (From Plan 01-01)

The research (CONTEXT.md D-10) specifies `Noto Sans Myanmar UI` but that variant is not available in `next/font/google`. Plan 01-01 already handled this deviation by using `Noto_Sans_Myanmar` instead. This plan preserves that decision — no new deviation introduced.

### No Other Deviations

Plan executed exactly as written. All patterns matched the research-verified architecture (Pitfalls D, G addressed per plan spec).

## Known Stubs

None. The i18n infrastructure is functional — messages load, locale is set, middleware composes correctly. No placeholder values that would block the plan's goal.

## Self-Check: PASSED
