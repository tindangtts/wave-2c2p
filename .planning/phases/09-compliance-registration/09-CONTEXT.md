# Phase 9: Compliance & Registration - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Insert three new screens into the registration flow (pre-registration info, T&C consent, daily limit acknowledgment) and enhance the KYC capture flow with a selfie/liveness face guide overlay. All screens must be i18n-ready (EN/TH/MM) and follow existing registration UX patterns.

</domain>

<decisions>
## Implementation Decisions

### Registration Flow Insertion Points
- T&C consent screen goes after OTP verification, before personal-info — user must consent before providing personal data (PDPA requirement)
- Pre-registration info screen goes before OTP (after phone entry on welcome screen) — explains required documents before user commits to registration
- Daily limit acknowledgment goes after T&C consent, before personal-info — grouped with other consent/info screens
- Store consent data: add `tcAcceptedAt` + `tcVersion` fields to registration store + persist to `user_profiles` table on API call

### Selfie/Liveness Capture UX
- Circular cutout with dashed border for face guide overlay — matches Pencil design
- Instructions text below the circular guide: "Position your face within the circle" with i18n
- Selfie goes after document back capture (existing `capture-selfie` step in KYC store) — already scaffolded, just needs face guide overlay UI
- Same confirm/retake pattern as document capture (existing `review-selfie` step) — show preview with Retake/Confirm buttons

### Screen Design & Content
- Pre-registration info: checklist of required documents (ID/passport, work permit) with icons — matches Pencil "Pre-Registration" screens
- T&C screen: scrollable content with two separate checkboxes (T&C + Privacy Policy) — both must be ticked, neither pre-checked
- Daily limit screen: card showing tier limits (KYC Pending vs KYC Approved) with "I understand" button
- All 3 new screens fully translated (EN/TH/MM) using existing next-intl pattern with `auth` namespace

### Claude's Discretion
No items — all decisions resolved.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StepIndicator` component — already used in registration, supports namespace prop
- `BackHeader` component — standard back navigation for auth pages
- `CameraOverlay` component — used in KYC capture, needs face guide enhancement
- `registration-store.ts` — Zustand with persist, 3-step state machine (step 1/2/3)
- `kyc-store.ts` — capture step state machine with `capture-selfie` and `review-selfie` already defined
- `auth` i18n namespace — existing translation file pattern

### Established Patterns
- Registration pages use `useRegistrationStore()` for state
- Pages use `useTranslations('auth')` for i18n
- Forms use React Hook Form + Zod resolver
- Auth layout provides consistent mobile-first container
- StepIndicator shows progress through registration steps

### Integration Points
- Registration flow: OTP page → (new pre-reg info) → (new T&C consent) → (new daily limit) → personal-info → id-details → create-passcode → KYC
- KYC capture: document-type → capture-front → review-front → capture-back → review-back → capture-selfie (enhance with face guide) → review-selfie → processing
- `registration-store` needs new fields: `tcAcceptedAt`, `tcVersion`
- `user_profiles` table needs columns: `tc_accepted_at`, `tc_version`

</code_context>

<specifics>
## Specific Ideas

- Pencil design has "Pre-Registration" (2 variants) and "T&C" (3 variants) screens to reference
- Pencil "Selfie" screens show circular face guide with instruction text
- iOS camera re-prompt prevention: selfie must stay in same single-page KYC capture route (already correct — `/kyc/capture` handles all steps)
- PDPA compliance: consent timestamp + version must be stored server-side

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
