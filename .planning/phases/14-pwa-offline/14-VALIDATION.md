---
phase: 14
slug: pwa-offline
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-15
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser verification (no automated test framework for PWA) |
| **Config file** | none — PWA behavior is verified via browser DevTools |
| **Quick run command** | `npx next build` (verify SW generated) |
| **Full suite command** | `npm run build && npm run start` + manual DevTools check |
| **Estimated runtime** | ~30 seconds (build) + ~2 minutes (manual check) |

---

## Sampling Rate

- **After every task commit:** Run `npx next build` — verify no TypeScript errors, `public/sw.js` generated
- **After wave merge:** Manual browser test: Chrome DevTools > Application > Manifest + Service Workers
- **Phase gate:** All 5 success criteria from ROADMAP verified manually

---

## Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Verification Method | Automated? |
|--------|----------|-----------|-------------------|------------|
| PWA-01 | Manifest served with correct fields, icons, splash | Manual | DevTools > Application > Manifest | No |
| PWA-02 | App shell loads from cache offline | Manual | DevTools > Network > Offline checkbox | No |
| PWA-03 | Static assets served CacheFirst, long TTL | Manual | DevTools > Application > Cache Storage | No |
| PWA-04 | API routes use NetworkFirst, offline fallback shown | Manual | DevTools > Network > Offline + navigate | No |
| PWA-05 | Install prompt appears on mobile | Manual | Visit on mobile Chrome / check iOS instructions | No |

**Note:** PWA service worker behavior is inherently a manual/browser test concern. These requirements cannot be meaningfully tested with Vitest unit tests. Playwright E2E could verify manifest file existence and basic SW registration, but full offline cache behavior requires DevTools simulation.

---

## Wave 0 Gaps

- No Vitest config exists yet (Phase 16 creates it — not blocking Phase 14)
- PWA tests are manual-only; no automated test files needed for this phase
- All validation is via `next build` success + manual browser DevTools inspection

*(No automated test gaps — PWA behavior is verified via browser/DevTools)*
