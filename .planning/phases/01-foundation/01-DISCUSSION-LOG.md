# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-14
**Phase:** 01-foundation
**Mode:** Auto (--auto flag)
**Areas discussed:** i18n Strategy, Mock Service Behavior, Currency Precision, Design Token Refinement

---

## i18n Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Cookie-based locale | Set locale via cookie, read in proxy.ts. No URL restructuring. | ✓ |
| URL-prefix routing | /en/, /th/, /mm/ prefixes. Requires route restructuring. | |

**User's choice (auto):** Cookie-based locale (recommended default)
**Notes:** Banking URLs should not leak locale/PII. Cookie approach avoids restructuring all routes under `[locale]/`.

| Option | Description | Selected |
|--------|-------------|----------|
| One JSON per locale per feature | messages/en/home.json, messages/th/auth.json | ✓ |
| One JSON per locale (monolith) | messages/en.json with all strings | |
| Namespace by route | messages/en/(main)/home.json | |

**User's choice (auto):** One JSON per locale per feature (recommended default)
**Notes:** Keeps bundles small per page load on 3G connections.

---

## Mock Service Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-approve after delay | Default approval with configurable delay and env var override | ✓ |
| Always reject | Default rejection for testing rejection flows | |
| Random outcome | 80% approve, 20% reject | |

**User's choice (auto):** Auto-approve after delay (recommended default)
**Notes:** Faster development loop. Use MOCK_KYC_AUTO_APPROVE=false for rejection testing.

| Option | Description | Selected |
|--------|-------------|----------|
| Instant success + configurable delay | MOCK_PAYMENT_DELAY_MS env var controls delay | ✓ |
| Simulated processing pipeline | Multiple status transitions over time | |

**User's choice (auto):** Instant success with configurable delay (recommended default)

---

## Currency Precision

| Option | Description | Selected |
|--------|-------------|----------|
| Integer in smallest unit | Store/calculate as satang/pya, convert for display only | ✓ |
| Decimal with rounding | Use parseFloat with toFixed(2) rounding | |
| Library (dinero.js) | Third-party money library | |

**User's choice (auto):** Integer in smallest unit (recommended default)
**Notes:** Avoids IEEE 754 floating-point errors. Standard banking practice.

---

## Design Token Refinement

| Option | Description | Selected |
|--------|-------------|----------|
| Noto Sans Myanmar UI | OpenType-only, works on Chrome/Safari/iOS | ✓ |
| Padauk | Requires Graphite rendering (Firefox only) | |
| Noto Sans Myanmar | Different weight set, less UI-optimized | |

**User's choice (auto):** Noto Sans Myanmar UI (recommended default)
**Notes:** Only font that renders correctly across all target browsers without Graphite engine.

---

*Generated: 2026-04-14 (auto mode)*
