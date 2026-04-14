---
phase: 1
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-14
---

# Phase 1 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (installed by Plan 03 Task 1) |
| **Config file** | vitest.config.ts (created by Plan 03 Task 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUN-01, FOUN-02, FOUN-03 | grep+build | `grep "safe-area-inset" src/app/globals.css && grep "\-\-primary.*FFE600" src/app/globals.css && grep "text-display" src/app/globals.css` | Yes | pending |
| 01-01-02 | 01 | 1 | FOUN-01, FOUN-02 | grep+build | `grep "Noto_Sans_Thai" src/app/layout.tsx && grep "max-w-\[430px\]" src/app/layout.tsx` | Yes | pending |
| 01-01-03 | 01 | 1 | FOUN-02, FOUN-03 | grep | `grep 'aria-label="Main"' src/components/layout/bottom-nav.tsx && grep 'min-h-\[44px\]' src/components/layout/bottom-nav.tsx && grep 'success' src/components/ui/badge.tsx` | Yes | pending |
| 01-02-01 | 02 | 2 | FOUN-05 | grep+build | `grep "createNextIntlPlugin" next.config.ts && grep "localePrefix.*never" src/i18n/routing.ts && test -f messages/mm/common.json` | Yes | pending |
| 01-02-02 | 02 | 2 | FOUN-05 | grep+build | `grep "createMiddleware" src/proxy.ts && grep "lang={locale}" src/app/layout.tsx && npm run build` | Yes | pending |
| 01-03-01 | 03 | 1 | FOUN-08 | unit | `npx vitest run src/lib/__tests__/currency.test.ts` | Created by Plan 03 | pending |
| 01-03-02 | 03 | 1 | FOUN-06, FOUN-07 | grep+build | `grep "MOCK_KYC_AUTO_APPROVE" src/app/api/mock-kyc/verify-document/route.ts && grep "MOCK_EXCHANGE_RATE_THB_MMK" src/app/api/mock-payment/exchange-rate/route.ts` | Yes | pending |
| 01-04-01 | 04 | 1 | FOUN-04 | grep | `grep -c "bigint" .planning/supabase-schema.sql && grep "insert own profile" .planning/supabase-schema.sql` | Yes | pending |

*Status: pending / green / red / flaky*

---

## Plan-Requirement Coverage

| Requirement | Plan(s) | Verification |
|-------------|---------|--------------|
| FOUN-01 | 01 | grep safe-area-inset in globals.css; grep max-w-[430px] in layout.tsx |
| FOUN-02 | 01 | grep typography tokens in globals.css; grep absolute radius values |
| FOUN-03 | 01 | grep --primary FFE600 in globals.css; grep badge variants |
| FOUN-04 | 04 | grep bigint in schema.sql; grep INSERT/UPDATE policies |
| FOUN-05 | 02 | grep createNextIntlPlugin; grep localePrefix never; message files exist |
| FOUN-06 | 03 | grep MOCK_KYC_AUTO_APPROVE in KYC routes |
| FOUN-07 | 03 | grep MOCK_EXCHANGE_RATE_THB_MMK in payment routes |
| FOUN-08 | 03 | vitest run currency.test.ts passes; grep no parseFloat |

---

## Wave 0 Requirements

- [x] `vitest` + `@vitejs/plugin-react` -- installed by Plan 03 Task 1 (unconditional)
- [x] `vitest.config.ts` -- created by Plan 03 Task 1 with path aliases
- [x] `src/lib/__tests__/currency.test.ts` -- created by Plan 03 Task 1 (covers FOUN-08)

*Note: Plan 03 Task 1 installs vitest unconditionally as part of its work, not conditionally. All other tasks use grep-based verification which requires no test framework.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 375-430px viewport rendering | FOUN-01 | Visual layout verification | Open dev tools, set viewport to 375px and 430px, verify no horizontal scroll |
| iOS safe area insets | FOUN-01 | Requires iOS device/simulator | Open in iOS Safari, verify content avoids notch/home indicator |
| Noto Sans Myanmar UI rendering | FOUN-05 | Font rendering is visual | Switch to MM locale, verify Myanmar script renders correctly |
| WCAG AA contrast on brand colors | FOUN-02 | Contrast ratio check | Use axe DevTools to verify #212121 on #FFE600 passes AA |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
