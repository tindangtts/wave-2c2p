# Phase 8: Integration Fixes & Navigation Wiring - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

All cross-phase navigation links, i18n keys, and status vocabulary are correct — the Transfer flow is reachable from home, Visa Card quick action works, and stale routes are removed.

This phase closes gaps NEW-01 through NEW-07 from the v1.0 milestone audit.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure/wiring fix phase. Each gap has a specific fix identified in the audit report. Follow the audit recommendations directly.

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- `src/components/layout/bottom-nav.tsx` — Transfer href needs updating
- `src/components/features/quick-actions.tsx` — Restore Transfer action, fix Visa Card href
- `src/app/api/mock-payment/process-transfer/route.ts` — Status vocabulary alignment
- `messages/mm/auth.json`, `messages/th/auth.json` — Missing otp.refCode key
- `messages/mm/kyc.json`, `messages/th/kyc.json` — Missing status.expired.later/now keys

### Files to Delete
- `src/app/(main)/transfer/page.tsx` — Stale Phase 4 placeholder
- `src/app/(main)/withdrawal/page.tsx` — Stale Coming Soon stub
- `src/app/(main)/card/page.tsx` — Stale card placeholder
- `src/app/api/mock-payment/calculate-fees/route.ts` — Orphaned, never called

### Established Patterns
- Quick actions use PNG icons from /public/icons/qa-*.png
- Bottom nav uses SVG icons from /public/icons/nav-*.svg
- i18n keys follow nested JSON structure per namespace

</code_context>

<specifics>
## Specific Ideas

No specific requirements — follow audit report fixes directly.

</specifics>

<deferred>
## Deferred Ideas

None — all gaps addressed in this phase.

</deferred>
