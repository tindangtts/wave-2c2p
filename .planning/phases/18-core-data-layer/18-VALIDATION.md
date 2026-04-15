---
phase: 18
slug: core-data-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

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
| 18-01-01 | 01 | 1 | DATA-01 | build | `npm run build` | ✅ | ⬜ pending |
| 18-02-01 | 02 | 1 | DATA-01 | integration | `npx vitest run` | ✅ | ⬜ pending |
| 18-02-02 | 02 | 1 | DATA-02 | integration | `npx vitest run` | ✅ | ⬜ pending |
| 18-03-01 | 03 | 2 | DATA-06 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — Vitest already configured from Phase 16.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Wallet balance on home reflects DB value | DATA-01 | Requires running app + Supabase | Load home, check balance matches wallets row |
| Transaction history pagination | DATA-02 | Requires real data + scrolling | Insert 25+ rows, verify scroll loads more |
| Visa card freeze state from DB | DATA-06 | Requires running app + DB toggle | Set is_frozen=true in cards, verify UI shows frozen |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
