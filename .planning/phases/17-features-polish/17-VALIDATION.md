---
phase: 17
slug: features-polish
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-15
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 (existing from Phase 16) |
| **Config file** | vitest.config.ts (existing) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test` — verify no regressions
- **After wave merge:** Manual browser verification of PDF download and spending limits
- **Phase gate:** PDF downloads correctly with transactions; spending limits persist

---

## Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Verification Method | Automated? |
|--------|----------|-----------|-------------------|------------|
| FEAT-01 | PDF statement download | Manual | Download PDF from history page, verify content | No |
| FEAT-02 | Spending limits edit | Manual | Edit limits, refresh page, verify persistence | No |

**Note:** Both features require browser interaction (PDF download, form submission with Supabase persistence). Unit tests could cover the PDF generation function and Zod schema validation, but the primary verification is manual.

---

## Wave 0 Gaps

- No automated tests planned for PDF generation (manual browser verification)
- No automated tests planned for spending limits API (manual verification)
- Existing 109 unit tests serve as regression gate

*(Manual verification required — features are UI-driven with browser-specific behavior)*
