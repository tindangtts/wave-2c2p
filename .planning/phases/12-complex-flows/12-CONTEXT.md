# Phase 12: Complex Flows - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous workflow)

<domain>
## Phase Boundary

Add Visa card request + payment flow (address selection, FX conversion, success/fail modals) and standalone work permit 2nd document update flow (front + back capture, re-enter PENDING status).

</domain>

<decisions>
## Implementation Decisions

### Visa Card Request + Payment
- New routes: `/profile/card/request/page.tsx` (address selection + confirm), extends existing card display page
- Address selection: radio group — "Current Address" / "Mailing Address" with green checkmark on selected
- Payment confirmation shows FX conversion details (THB→MMK), fee (10 THB), total
- Success/fail modals use existing AlertDialog pattern
- Mock API: extend or create `/api/mock-payment/visa-card/route.ts` — configurable success/fail via MOCK_PAYMENT_FAIL env var
- Reuse PasscodeSheet for payment confirmation

### Work Permit Update
- New route: `/kyc/work-permit-update/page.tsx` — standalone flow, not part of initial registration
- Reuse existing CameraOverlay component for front + back capture
- Single-page flow (no route changes during capture) to avoid iOS camera re-prompt
- On submit: KYC status transitions to PENDING_UPDATE (not PENDING — preserves existing transfer access)
- Mock API: POST `/api/mock-kyc/work-permit-update/route.ts`

### Claude's Discretion
All implementation details at Claude's discretion — patterns well-established from prior phases.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `visa-card-display.tsx` — existing card display with reveal/freeze
- `profile/card/page.tsx` — existing card page
- `CameraOverlay` — already enhanced with selfie variant in Phase 9
- `KYCStore` — existing KYC state machine
- `PasscodeSheet` — reusable for Visa payment confirmation
- `AlertDialog` — for success/fail modals

### Integration Points
- Card page needs "Request Card" button linking to new request flow
- KYC store needs `PENDING_UPDATE` status handling
- Profile menu may need "Update Work Permit" entry for expired permits

</code_context>

<specifics>
## Specific Ideas

- Pencil "Visa Card Option 1/2", "Select Address", "Confirmation", "Payment Success/fail" screens
- Pencil "Work Permit Photo front/back" screens with camera overlay
- PRD Section 4.10: Visa card flow with 200 THB example, 10 THB fee
- PRD Section 4.11: 2nd Document Verification flow

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
