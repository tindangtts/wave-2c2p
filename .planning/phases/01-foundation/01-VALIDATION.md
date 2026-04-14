---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (not yet installed — Wave 0 installs) |
| **Config file** | none — Wave 0 installs |
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
| 01-01-01 | 01 | 1 | FOUN-01 | build | `npm run build` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUN-02 | visual | manual viewport check | N/A | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUN-03 | unit | `npx vitest run src/__tests__/mock-kyc` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | FOUN-04 | unit | `npx vitest run src/__tests__/mock-payment` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | FOUN-05 | unit | `npx vitest run src/__tests__/i18n` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | FOUN-06 | sql | `psql -f .planning/supabase-schema.sql` | ✅ | ⬜ pending |
| 01-05-01 | 05 | 3 | FOUN-07 | build | `npm run build` | ✅ | ⬜ pending |
| 01-05-02 | 05 | 3 | FOUN-08 | visual | manual font rendering check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@vitejs/plugin-react` — install test framework
- [ ] `vitest.config.ts` — configuration with path aliases
- [ ] `src/__tests__/mock-kyc/verify-document.test.ts` — stubs for FOUN-03
- [ ] `src/__tests__/mock-payment/calculate-fees.test.ts` — stubs for FOUN-04
- [ ] `src/__tests__/i18n/locale-switching.test.ts` — stubs for FOUN-05

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 375-430px viewport rendering | FOUN-01 | Visual layout verification | Open dev tools, set viewport to 375px and 430px, verify no horizontal scroll |
| iOS safe area insets | FOUN-02 | Requires iOS device/simulator | Open in iOS Safari, verify content avoids notch/home indicator |
| Noto Sans Myanmar UI rendering | FOUN-08 | Font rendering is visual | Switch to MM locale, verify Myanmar script renders correctly |
| WCAG AA contrast on brand colors | FOUN-02 | Contrast ratio check | Use axe DevTools to verify #212121 on #FFE600 passes AA |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
