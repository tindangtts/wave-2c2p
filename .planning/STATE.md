---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 06-01-PLAN.md
last_updated: "2026-04-14T13:02:14.218Z"
last_activity: 2026-04-14
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 22
  completed_plans: 19
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-14)

**Core value:** Users can send money from Thailand to Myanmar quickly, affordably, and with full regulatory compliance
**Current focus:** Phase 06 — wallet-operations

## Current Position

Phase: 06 (wallet-operations) — EXECUTING
Plan: 2 of 4
Status: Ready to execute
Last activity: 2026-04-14

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation P04 | 5 | 1 tasks | 1 files |
| Phase 01-foundation P03 | 2 | 2 tasks | 8 files |
| Phase 01-foundation P01 | 15 | 3 tasks | 4 files |
| Phase 01-foundation P02 | 5 | 2 tasks | 8 files |
| Phase 02-authentication P01 | 4 | 2 tasks | 11 files |
| Phase 02-authentication P02 | 15 | 2 tasks | 6 files |
| Phase 02-authentication P03 | 3 | 2 tasks | 6 files |
| Phase 02-authentication P04 | 10 | 2 tasks | 8 files |
| Phase 03-ekyc-onboarding P01 | 8 | 2 tasks | 8 files |
| Phase 03-ekyc-onboarding P03 | 8 | 2 tasks | 4 files |
| Phase 03-ekyc-onboarding P02 | 8 | 2 tasks | 6 files |
| Phase 03-ekyc-onboarding P04 | 15 | 2 tasks | 3 files |
| Phase 04-home-wallet P01 | 8 | 2 tasks | 9 files |
| Phase 04-home-wallet P02 | 8 | 2 tasks | 9 files |
| Phase 05-transfer-recipients P01 | 12 | 2 tasks | 12 files |
| Phase 05 P03 | 145 | 2 tasks | 5 files |
| Phase 05-transfer-recipients P02 | 5 | 2 tasks | 6 files |
| Phase 05 P04 | 3 | 2 tasks | 5 files |
| Phase 06-wallet-operations P01 | 81 | 2 tasks | 11 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Project: Scaffold with 16 routes already exists — Phase 1 hardens foundation, does not recreate it
- Project: eKYC and payment services are mock-only with env-var-configurable behavior
- Project: proxy.ts used instead of middleware.ts (Next.js 16 convention)
- [Phase 01-foundation]: All monetary columns use bigint satang/pya per D-07 — prevents 100x display errors from float-to-integer mismatch in financial calculations
- [Phase 01-foundation]: exchange_rate stays as numeric(10,4) — it is a ratio not a currency amount; INSERT policy added to user_profiles and UPDATE policy to wallets
- [Phase 01-foundation]: Integer arithmetic for all currency math: Math.round(satang * rate) not parseFloat chains
- [Phase 01-foundation]: Mock routes env-var-driven: MOCK_KYC_AUTO_APPROVE defaults true, MOCK_PAYMENT_FAIL defaults false
- [Phase 01-foundation]: Used Noto Sans Myanmar instead of Noto Sans Myanmar UI — UI variant not available in next/font/google
- [Phase 01-foundation]: Absolute pixel radius values (4px/8px/12px/16px) replace calc()-based values for predictable rendering
- [Phase 01-foundation]: D-01 implemented: localePrefix:'never' with cookie-based locale detection — no URL restructuring
- [Phase 01-foundation]: D-03 implemented: createNextIntlPlugin wired, getRequestConfig returns explicit locale (v4 requirement)
- [Phase 01-foundation]: Middleware composition: updateSession first, then intlMiddleware — preserves auth redirects
- [Phase 02-authentication]: Zod superRefine for phone validation: cross-field digit-stripping + country-specific length rules in one pass
- [Phase 02-authentication]: PBKDF2 310k iterations (OWASP 2023 sha256 recommendation) + timingSafeEqual for passcode — Node.js built-in crypto, no extra package
- [Phase 02-authentication]: i18n: auth.json merged via spread under 'auth' namespace in request.ts — parallel load with common.json
- [Phase 02-authentication]: admin.auth.admin.getUserByPhone does not exist — use listUsers with .find() for phone lookup
- [Phase 02-authentication]: isLoginOnlyPage split from isAuthPage — /passcode excluded from auth redirect (needed for lock screen)
- [Phase 02-authentication]: base-ui Select onValueChange receives value | null — all handlers must guard against null before casting to typed enum
- [Phase 02-authentication]: Hydration-safe Zustand reads: mounted state + useEffect prevents SSR/client mismatch on localStorage-persisted store
- [Phase 02-authentication]: API errors are non-blocking in registration: Zustand store saves first, user advances even on API failure (offline resilience)
- [Phase 02-authentication]: 'use server' removed from passcode.ts — sync utility functions used in API routes must not be Server Actions (Next.js requires async)
- [Phase 02-authentication]: Base UI AlertDialogTrigger has no asChild prop — trigger rendered directly with className instead of wrapping button
- [Phase 02-authentication]: AppVisibilityGuard: inline 'use client' component in server layout wraps children to call useAppVisibility hook
- [Phase 03-ekyc-onboarding]: documentTypeSchema uses 5 types (national_id, work_permit, pink_card, owic, visa) — narrower enum than KYCDocument.document_type
- [Phase 03-ekyc-onboarding]: StepIndicator namespace prop defaults to 'auth.register' for backward-compat with Phase 2 registration pages
- [Phase 03-ekyc-onboarding]: ProcessingSteps uses sequential setTimeout chain (not interval) for precise step timing
- [Phase 03-ekyc-onboarding]: Auto-redirect on approval uses useEffect with 2s timeout + aria-live=assertive for screen readers
- [Phase 03-ekyc-onboarding]: Camera capture via native <input capture> attribute — single /kyc/capture route to avoid iOS PWA permission re-prompts
- [Phase 03-ekyc-onboarding]: router.push paths in Next.js App Router must not include route group names like (auth)
- [Phase 03-ekyc-onboarding]: Rejection heuristic maps keyword patterns to fields: document/blurry/expired → front+back rejected; face/photo → selfie rejected
- [Phase 03-ekyc-onboarding]: retakeMode null|front|back|selfie drives inline CameraOverlay per field — avoids extra routes and iOS PWA camera permission re-prompts
- [Phase 03-ekyc-onboarding]: KYCExpiredModal AlertDialog uses controlled mode (open prop only) — parent component owns open/close lifecycle
- [Phase 04-home-wallet]: SWR dedupingInterval 30s per D-10; missing wallet returns null not 500; stroke-[2.5] vs stroke-[1.5] for active/inactive icon differentiation in BottomNav
- [Phase 04-home-wallet]: Embla carousel used directly (not shadcn wrapper) for precise dot indicator sync via onSelect callback
- [Phase 04-home-wallet]: localStorage hydration uses useState(true) + useEffect pattern to prevent SSR mismatch in WalletCard balance visibility
- [Phase 05-transfer-recipients]: Recipient extended fields (first_name, last_name, transfer_type, bank fields) enriched in API response — DB schema uses legacy columns pending migration
- [Phase 05-transfer-recipients]: Transfer store partialize excludes transactionId and status (ephemeral); MOCK_EXCHANGE_RATE (default 133.0) used for new /rate endpoint separate from existing exchange-rate endpoint
- [Phase 05]: Long-press backspace (300ms) clears full amount using pointerDown/pointerUp — touch and mouse compatible
- [Phase 05]: Rate fetch uses plain useEffect + fetch (not SWR) since it runs once on mount and stores in Zustand
- [Phase 05]: Channel fee schedule defined as const map (D-14 values) — no API call needed
- [Phase 05-transfer-recipients]: Base UI DropdownMenuTrigger has no asChild prop — trigger rendered directly with className
- [Phase 05-transfer-recipients]: Edit recipient form loads from SWR cache by ID via form.reset() — avoids redundant GET request
- [Phase 05]: PasscodeSheet uses /api/auth/passcode/verify for server-side PBKDF2 — no client hash exposure
- [Phase 05]: ReceiptPage uses custom header with X close button (not BackHeader) — terminal screen has no back navigation
- [Phase 06-wallet-operations]: sessionStorage (not localStorage) for wallet-ops-store — wallet flow state is session-scoped; avoids stale topup/withdraw state across sessions
- [Phase 06-wallet-operations]: transactions route uses .select('*, recipients(*)') join — single query for enriched data, avoids secondary client fetch
- [Phase 06-wallet-operations]: withdraw deducts balance immediately before async completion — prevents double-spend with rollback on tx insert failure

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-04-14T13:02:14.215Z
Stopped at: Completed 06-01-PLAN.md
Resume file: None
