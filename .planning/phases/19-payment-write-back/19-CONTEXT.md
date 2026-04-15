# Phase 19: Payment Write-Back - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — smart discuss skipped)

<domain>
## Phase Boundary

Wire all mock payment API routes to insert real transactions into Supabase via Drizzle ORM and update wallet balances atomically. Covers: process-transfer (A/C + cash pickup), p2p-transfer, topup, and withdraw. Each payment action must create a transaction row AND update wallet balance in a single atomic operation. Failed API calls must leave wallet balance unchanged.

</domain>

<decisions>
## Implementation Decisions

### Atomic Operations
- Use Drizzle transactions (db.transaction()) to ensure wallet balance update + transaction insert happen atomically
- If either operation fails, both roll back — wallet balance remains unchanged
- Supabase client kept for auth only; all data writes via Drizzle

### Claude's Discretion
All implementation choices (error handling patterns, response shapes, fee calculation) are at Claude's discretion — infrastructure phase. Preserve existing API response contracts so client-side code doesn't break.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/db/schema.ts — Drizzle schema with wallets, transactions tables (from Phase 18)
- src/db/index.ts — Lazy db singleton with neon-http adapter
- src/app/api/mock-payment/process-transfer/route.ts — Current mock transfer
- src/app/api/mock-payment/p2p-transfer/route.ts — Current mock P2P
- src/app/api/mock-payment/topup/route.ts — Current mock top-up
- src/app/api/mock-payment/withdraw/route.ts — Current mock withdrawal

### Established Patterns
- Mock payment routes accept amount, passcode_hash, recipient details
- They return success/failure with simulated delays
- Wallet balance is NOT actually updated currently — just returns mock success
- Phase 18 established the pattern: keep isDemoMode branch, add Drizzle queries in non-demo path

### Integration Points
- These routes are called from transfer confirm, add-money, and withdraw pages
- Transaction records created here should be visible in /api/transactions (Phase 18)
- Wallet balance changes should be reflected in /api/wallet (Phase 18)

</code_context>

<specifics>
## Specific Ideas

- All bigint amounts in satang (1 THB = 100 satang) — matches existing schema convention
- Preserve existing mock payment API response shapes
- Fee calculation: use existing fee constants from mock routes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
