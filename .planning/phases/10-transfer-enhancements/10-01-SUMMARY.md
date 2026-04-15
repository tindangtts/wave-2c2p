---
phase: 10-transfer-enhancements
plan: 01
subsystem: api
tags: [zustand, p2p, transfer, recipients, supabase, typescript]

# Dependency graph
requires:
  - phase: 09-compliance-consent
    provides: auth pattern (createClient + getUser), Zustand persist pattern
provides:
  - P2P Zustand store (useP2PStore) with 5 actions and selective persistence
  - POST /api/mock-payment/p2p-transfer endpoint with sender/receiver validation
  - POST /api/mock-payment/refresh-secret-code endpoint returning 6-char code
  - PATCH /api/recipients/[id] for is_favorite toggle (pre-existing, verified)
  - TransferChannel union extended with "p2p" value
  - Transaction interface extended with optional secretCode field
affects:
  - 10-02 (P2P screens — consume useP2PStore and p2p-transfer API)
  - 10-03 (receipt extensions — consume secretCode from Transaction)
  - 10-04 (recipient tabs — consume PATCH is_favorite endpoint)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "P2P store uses wave-p2p-store key (separate from wave-transfer-store to avoid collision)"
    - "P2P fee is 0 satang (wallet-to-wallet, instant, no intermediary cost)"
    - "Refresh-secret-code is stateless mock — generates code on demand, no DB persistence"

key-files:
  created:
    - src/stores/p2p-store.ts
    - src/app/api/mock-payment/p2p-transfer/route.ts
    - src/app/api/mock-payment/refresh-secret-code/route.ts
  modified:
    - src/types/index.ts
    - src/components/features/channel-card.tsx
    - src/app/(main)/transfer/channel/page.tsx
    - src/app/api/mock-payment/process-transfer/route.ts
    - src/app/(main)/transfer/edit-recipient/[id]/page.tsx

key-decisions:
  - "P2P store key is wave-p2p-store (not wave-transfer-store) to prevent state collision when both flows are active"
  - "P2P fee hardcoded to 0 satang per product decision (wallet-to-wallet is free)"
  - "refresh-secret-code is mock-only, stateless — returns generated code without DB write"
  - "Record<TransferChannel, ...> exhaustiveness fixed in channel-card and channel/page with p2p fallbacks (p2p not shown in regular transfer flow)"
  - "edit-recipient form guards against p2p transfer_type with fallback to wave_app (P2P recipients don't use the edit form)"

patterns-established:
  - "Separate Zustand store per feature flow to avoid key collision"
  - "P2P transfer performs two balance updates (deduct sender, credit receiver) with rollback on receiver update failure"

requirements-completed:
  - P2P-01
  - P2P-03
  - CHAN-01
  - CHAN-02
  - CHAN-03
  - REC-01

# Metrics
duration: 5min
completed: 2026-04-15
---

# Phase 10 Plan 01: Transfer Enhancements Foundation Summary

**P2P Zustand store, wallet-to-wallet transfer API with balance debit/credit, stateless secret-code refresh, and TransferChannel extended with "p2p"**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-15T03:44:00Z
- **Completed:** 2026-04-15T03:48:09Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Created `useP2PStore` Zustand store with 5 actions, selective persistence (receiverWalletId + amountSatang only), separate store key from transfer-store
- POST `/api/mock-payment/p2p-transfer` validates sender≠receiver by user_id, deducts sender + credits receiver, inserts transaction with channel="p2p", fee=0, respects MOCK_PAYMENT_FAIL
- POST `/api/mock-payment/refresh-secret-code` auth-guarded, returns 6-char uppercase alphanumeric code on demand (stateless mock)
- PATCH `/api/recipients/[id]` confirmed pre-existing and correct — auth guard, ownership verify, boolean validation, is_favorite DB update
- Extended TransferChannel union with "p2p" and fixed all downstream exhaustiveness errors in Record<TransferChannel> maps

## Task Commits

1. **Task 1: P2P Zustand store + extend TransferChannel type** - `526bcf5` (feat)
2. **Task 2: P2P transfer API + secret code refresh API** - `44499b1` (feat)
3. **Task 3: Recipient PATCH endpoint** - pre-existing, no commit needed

## Files Created/Modified

- `src/stores/p2p-store.ts` - Zustand store for P2P transfer flow (new)
- `src/app/api/mock-payment/p2p-transfer/route.ts` - P2P transfer POST handler (new)
- `src/app/api/mock-payment/refresh-secret-code/route.ts` - Secret code refresh POST handler (new)
- `src/types/index.ts` - Added "p2p" to TransferChannel, added secretCode? to Transaction
- `src/components/features/channel-card.tsx` - Added p2p to CHANNEL_CONFIG for exhaustiveness
- `src/app/(main)/transfer/channel/page.tsx` - Added p2p to CHANNEL_FEES_THB and channelNames
- `src/app/api/mock-payment/process-transfer/route.ts` - Added p2p: 0 to channelFees
- `src/app/(main)/transfer/edit-recipient/[id]/page.tsx` - Guard against p2p transfer_type in form.reset

## Decisions Made

- P2P store key `wave-p2p-store` keeps it isolated from `wave-transfer-store` (prevents localStorage collision when a user has both flows active)
- P2P fee is 0 satang per product decision (same-currency, wallet-to-wallet transfer has no processing cost)
- `refresh-secret-code` is stateless (mock API returns a freshly generated code on every call without any DB write — sufficient for mock behavior)
- PATCH `/api/recipients/[id]` was already implemented in the codebase — Task 3 was verified, not re-implemented

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript exhaustiveness errors after TransferChannel extension**
- **Found during:** Task 1 (extending TransferChannel union)
- **Issue:** Adding "p2p" to `TransferChannel` caused TS2741 errors in 4 files using `Record<TransferChannel, ...>` which required all members
- **Fix:** Added `p2p` entry to CHANNEL_CONFIG, CHANNEL_FEES_THB, channelNames, channelFees in respective files; added type guard in edit-recipient form to fall back from p2p to wave_app
- **Files modified:** channel-card.tsx, channel/page.tsx, process-transfer/route.ts, edit-recipient/[id]/page.tsx
- **Verification:** `npx tsc --noEmit` returns 0 errors
- **Committed in:** `526bcf5` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type exhaustiveness bug)
**Impact on plan:** Required for TypeScript compilation. No scope creep — all fixes are minimal compatibility shims for the union extension.

## Issues Encountered

- Task 3 (PATCH endpoint) was already implemented in the existing `recipients/[id]/route.ts` file — no re-implementation needed, only verification.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Foundation complete for all Wave 2 P2P screens (10-02)
- `useP2PStore` ready to import in P2P page components
- `/api/mock-payment/p2p-transfer` ready to call from P2P confirm flow
- `/api/mock-payment/refresh-secret-code` ready for cash-pickup receipt refresh
- PATCH `/api/recipients/[id]` ready for favourite toggle in recipient list tabs

---
*Phase: 10-transfer-enhancements*
*Completed: 2026-04-15*
