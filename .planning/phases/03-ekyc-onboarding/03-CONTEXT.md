# Phase 3: eKYC Onboarding - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the complete eKYC onboarding flow: document type selection (5 types), front/back document capture with camera guide overlay, face verification with circular liveness frame, mock verification processing, KYC status page (pending/approved/rejected/expired), and re-submission flow for rejected users. All verification is mock-only via existing mock KYC API routes.

</domain>

<decisions>
## Implementation Decisions

### Document Capture UX
- **D-01:** Native `<input type="file" accept="image/*" capture="environment">` with MediaDevices fallback — simplest cross-platform approach. Auto-falls back to file picker on iOS PWA standalone mode without error. No third-party camera library needed.
- **D-02:** 5 document types: National ID, Work Permit, Pink Card, OWIC, Visa — each requires front and back capture.
- **D-03:** Camera guide overlay: rounded rectangle outline matching ID card proportions (85.6mm × 54mm ratio) with corner markers and instruction text.
- **D-04:** Image storage: base64 in component state, POST to mock API. No real upload — images stored temporarily for the verification request only.

### Face Verification & Liveness
- **D-05:** Circular frame overlay with face silhouette guide and animated pulse ring to indicate active capture.
- **D-06:** Mock verification: 3-second simulated processing, then result based on `MOCK_KYC_AUTO_APPROVE` env var. Reuses existing mock KYC routes from Phase 1. Returns approval or randomized rejection reasons.
- **D-07:** Selfie capture: `<input type="file" accept="image/*" capture="user">` (front camera). Same fallback pattern as document capture.
- **D-08:** Re-submission after rejection: show rejected fields highlighted, pre-fill accepted fields, allow re-capture of failed documents only — minimizes user effort.

### KYC Status & Flow
- **D-09:** KYC status page: card-based display with icon, status badge, description, and action button. Pending=clock/yellow, Approved=check/green, Rejected=X/red, Expired=clock/gray.
- **D-10:** KYC flow sequence: Select Doc Type → Capture Front → Capture Back → Face Verify → Processing → Status. Single linear flow within `(auth)` route group, no bottom nav.
- **D-11:** KYC data stored in `kyc_submissions` table (already in Supabase schema). Write via API route after all captures complete. Status polled from this table.
- **D-12:** Navigation after approval: auto-redirect to /home after 2s with "Continue" button fallback. Rejected stays on status page with "Resubmit" button.

### Claude's Discretion
- Camera overlay animation details and styling
- Processing screen animation (spinner, progress steps)
- Exact error messages for camera permission denial
- Document type icons and visual treatment
- KYC status page transition animations

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/api/mock-kyc/verify-document/route.ts` — existing mock KYC verify document route (env-var configurable from Phase 1)
- `src/app/api/mock-kyc/verify-face/route.ts` — existing mock KYC face verify route
- `src/components/ui/badge.tsx` — status badges with success/warning/info variants
- `src/components/ui/card.tsx` — card component for status display
- `src/components/ui/select.tsx` — document type selector
- `src/components/features/step-indicator.tsx` — could be adapted for KYC progress
- Phase 1 design tokens, Phase 2 auth patterns (session, middleware)

### Established Patterns
- Auth guard via proxy.ts — user must be authenticated
- i18n message files per feature (`messages/{locale}/kyc.json`)
- Zustand for client state, API routes for server mutations
- Zod validation on API inputs
- Mobile-first 430px container, 44px touch targets

### Integration Points
- `src/app/(auth)/` — KYC pages live here (no bottom nav during onboarding)
- `.planning/supabase-schema.sql` — `kyc_submissions` table exists
- `src/app/api/mock-kyc/` — existing routes need document/face submission endpoints
- After KYC approval → redirect to home (Phase 4 entry point)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following prototype screens.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
