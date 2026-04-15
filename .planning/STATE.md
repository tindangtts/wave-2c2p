---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Supabase Migration & Auth Hardening
status: verifying
stopped_at: Completed 19-02-PLAN.md
last_updated: "2026-04-15T11:49:48.477Z"
last_activity: 2026-04-15
progress:
  total_phases: 14
  completed_phases: 11
  total_plans: 37
  completed_plans: 37
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-15)

**Core value:** Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance
**Current focus:** Phase 19 — payment-write-back

## Current Position

Phase: 20
Plan: Not started
Status: Phase complete — ready for verification
Last activity: 2026-04-15

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed (v1.2): 12
- Average duration: ~4 min/plan
- Total execution time: ~48 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 18. Core Data Layer | 0/TBD | — | — |
| 19. Payment Write-Back | 0/TBD | — | — |
| 20. New Tables & Seed | 0/TBD | — | — |
| 21. System Config & Auth Gates | 0/TBD | — | — |
| 22. Demo Mode Removal | 0/TBD | — | — |

*Updated after each plan completion*
| Phase 14-pwa-offline P01 | 252s | 2 tasks | 5 files |
| Phase 15-qr-scanner-webauthn-migration P03 | 180 | 1 tasks | 1 files |
| Phase 15-qr-scanner-webauthn-migration P01 | 240s | 2 tasks | 3 files |
| Phase 15-qr-scanner-webauthn-migration P02 | 180s | 2 tasks | 2 files |
| Phase 16-test-coverage P01 | 3min | 1 tasks | 5 files |
| Phase 16-test-coverage P02 | 8min | 2 tasks | 4 files |
| Phase 16-test-coverage P04 | 101s | 2 tasks | 4 files |
| Phase 16-test-coverage P03 | 15min | 2 tasks | 4 files |
| Phase 16-test-coverage P05 | 90s | 1 tasks | 2 files |
| Phase 17-features-polish P01 | 276s | 2 tasks | 8 files |
| Phase 17-features-polish P02 | 286s | 2 tasks | 7 files |
| Phase 18-core-data-layer P01 | 134s | 1 tasks | 5 files |
| Phase 18-core-data-layer P02 | 5min | 2 tasks | 3 files |
| Phase 19-payment-write-back P01 | 117s | 2 tasks | 2 files |
| Phase 19-payment-write-back P02 | 151s | 2 tasks | 2 files |

## Accumulated Context

### Decisions

- v1.2 scope: production readiness — no new UI screens; infrastructure and hardening focus
- Serwist chosen over next-pwa (unmaintained, broken on Next.js 15+)
- @yudiel/react-qr-scanner chosen for live QR; file-input fallback for iOS PWA camera limitations
- Vitest for unit/RTL tests; Playwright for E2E against localhost:3000
- [Phase 14-pwa-offline]: @serwist/next webpack plugin requires --webpack build flag in Next.js 16.2.3 (Turbopack default); added build:pwa script
- [Phase 14-pwa-offline]: Serwist disabled in dev (NODE_ENV === development); Supabase routes use NetworkFirst with 0s timeout (never cache auth tokens)
- [Phase 15-qr-scanner-webauthn-migration]: WebAuthn columns all nullable except counter (DEFAULT 0) — ADD COLUMN IF NOT EXISTS for idempotent migration
- [Phase 15-qr-scanner-webauthn-migration]: @yudiel/react-qr-scanner with finder:false; ScannerFrame provides overlay; handledRef prevents double-fire
- [Phase 15-qr-scanner-webauthn-migration]: P2P_WALLET_REGEX extracted to qr-detection module; detectQRType returns discriminated union for type-safe routing
- [Phase 15-qr-scanner-webauthn-migration]: decodeQRFromFile uses dynamic barcode-detector/pure polyfill import (SSR safe, no double-polyfill with @yudiel bundle)
- [Phase 16-test-coverage]: jsdom environment set globally in vitest config (safe for both React and pure-TS tests); .claude worktrees excluded from test discovery
- [Phase 16-test-coverage]: Pre-existing new-recipient.test.tsx failure logged to deferred-items.md (out of scope for 16-02 — scope boundary rule applied)
- [Phase 16-test-coverage]: DEMO_MODE middleware redirects /login /otp /register to /home — E2E tests for registration form require DEMO_MODE=false with real Supabase or test instance
- [Phase 16-test-coverage]: Playwright E2E tests scoped to DEMO_MODE-accessible paths: auto-auth redirect, home render, KYC document selection, capture navigation
- [Phase 16-test-coverage]: AmountInput is a custom keypad; RTL tests interact via aria-label button clicks, not native input typing
- [Phase 16-test-coverage]: Exclude src/e2e/** from vitest discovery — Playwright specs use test.describe() which errors in Vitest context
- [Phase 16-test-coverage]: Exact button name match required in Playwright (name: 'Next', exact: true) — Next.js 16 dev mode injects a Dev Tools button matching /next/i
- [Phase 16-test-coverage]: DEMO_MODE passcode verify accepts any 6-digit code — E2E tests use 123456
- [Phase 17-features-polish]: jspdf-autotable installed as separate package (not bundled in jsPDF 4.x despite research claim)
- [Phase 17-features-polish]: English-only PDF labels per research recommendation (no Thai/Myanmar font embedding)
- [Phase 17-features-polish]: Dedicated /api/statement route (not reusing paginated /api/transactions)
- [Phase 17-features-polish]: Tier detection from dailyLimitSatang value match — fallback to premium if no match
- [v1.3 roadmap]: DATA-08 (demo mode removal) is the final phase — all 72 isDemoMode files must be wired to Supabase first
- [v1.3 roadmap]: Missing tables notifications + vouchers + system_config must be created via SQL migration in Phase 20/21
- [v1.3 roadmap]: AUTH-01 (SystemConfig table) executes before AUTH-02/03 (which read from it) — both in Phase 21
- [Phase 18-core-data-layer]: timestamptz not exported from drizzle-orm/pg-core@0.45.2; use timestamp({ withTimezone: true }) alias in schema.ts
- [Phase 18-core-data-layer]: drizzle-orm/neon-http adapter chosen for Supabase PostgreSQL (stateless HTTP, no TCP pooler issues)
- [Phase 18-core-data-layer]: Paginated transactions list omits recipients join; only single fetch by ID uses leftJoin — reduces query cost for list views
- [Phase 18-core-data-layer]: snake_case column aliases in Drizzle select preserve existing API contract consumed by client hooks (max_topup, first_name, wallet_id, created_at)
- [Phase 19-payment-write-back]: db.batch() used for atomic wallet+transaction write in process-transfer and withdraw routes; neon-http driver does not support db.transaction()
- [Phase 19-payment-write-back]: db.batch() used for atomicity in payment routes — neon-http adapter does not support db.transaction(); topup writes status:success immediately while response returns pending for UI compatibility

### Pending Todos

None yet.

### Blockers/Concerns

- DB-01/DB-02: WebAuthn SQL migration requires a deployed HTTPS domain — local dev cannot fully verify biometric enrollment
- Phase 16 E2E tests (TEST-04, TEST-05) require a running dev server; CI pipeline setup may be needed
- Phase 21 AUTH-05 (single active session): Supabase `auth.admin.signOut(userId, 'others')` requires service role key — confirm env var is set

## Session Continuity

Last session: 2026-04-15T11:45:56.231Z
Stopped at: Completed 19-02-PLAN.md
Resume file: None
Next step: `/gsd:plan-phase 18`
