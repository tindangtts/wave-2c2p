---
phase: 03-ekyc-onboarding
plan: "01"
subsystem: kyc-infrastructure
tags: [kyc, zod, zustand, i18n, step-indicator, mock-api]
dependency_graph:
  requires: [Phase 2 auth patterns, Supabase admin client, existing mock KYC routes]
  provides: [documentTypeSchema, kycSubmissionSchema, useKYCStore, kyc i18n messages, StepIndicator dark variant, mock KYC submit API]
  affects: [Phase 3 Plans 02-04 (all KYC screens consume these artifacts)]
tech_stack:
  added: []
  patterns: [Zustand persist with partialize, Zod v4 safeParse validation, next-intl namespace loading, Next.js API route with Supabase admin client]
key_files:
  created:
    - src/lib/kyc/schemas.ts
    - src/stores/kyc-store.ts
    - messages/en/kyc.json
    - messages/th/kyc.json
    - messages/mm/kyc.json
    - src/app/api/mock-kyc/submit/route.ts
  modified:
    - src/i18n/request.ts
    - src/components/features/step-indicator.tsx
decisions:
  - "documentTypeSchema uses 5 types matching context: national_id, work_permit, pink_card, owic, visa (not id_card from KYCDocument type — KYC flow uses its own narrower enum)"
  - "KYC Zustand store persists all captured images in localStorage — offline resilience for poor connectivity users"
  - "StepIndicator namespace prop defaults to 'auth.register' — backward-compatible with Phase 2 registration pages"
  - "Mock submit API uses Supabase admin client for kyc_documents insert — bypasses RLS for mock service pattern"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  files_created: 6
  files_modified: 2
---

# Phase 3 Plan 01: KYC Infrastructure Summary

**One-liner:** Zod schemas for 5 KYC document types, Zustand persist store for capture flow state, en/th/mm i18n messages, StepIndicator dark variant, and mock submit API writing to kyc_documents table.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | KYC Zod schemas, Zustand store, and i18n messages | afb3994 | src/lib/kyc/schemas.ts, src/stores/kyc-store.ts, messages/{en,th,mm}/kyc.json, src/i18n/request.ts |
| 2 | Adapt StepIndicator for 5 steps and create mock submission API | c62a9b3 | src/components/features/step-indicator.tsx, src/app/api/mock-kyc/submit/route.ts |

## What Was Built

### KYC Zod Schemas (`src/lib/kyc/schemas.ts`)
- `documentTypeSchema`: z.enum with 5 document types (national_id, work_permit, pink_card, owic, visa)
- `kycSubmissionSchema`: validates client-side form data with base64 image strings
- `kycSubmitRequestSchema`: validates snake_case API request body
- `kycStatusSchema`: mirrors KYCStatus type from src/types/index.ts
- All schemas export inferred TypeScript types

### KYC Zustand Store (`src/stores/kyc-store.ts`)
- 9-step `CaptureStep` union type covering full flow: select-type → capture-front → review-front → capture-back → review-back → capture-selfie → review-selfie → processing → status
- State: documentType, frontImage, backImage, selfieImage, submissionId, kycStatus, rejectionReasons
- Persist middleware with key `'wave-kyc-state'` and localStorage storage
- `partialize` excludes actions from persistence (same pattern as registration store)
- `setSubmissionResult` action sets status + rejection reasons + submission ID in one call

### i18n Messages (en/th/mm)
- All copy for all KYC screens: selectDocType, docTypes, capture, review, face, processing, status (4 states), resubmit, expiredModal, cancelDialog, errors
- Thai translations use appropriate financial/legal terminology
- Myanmar/Burmese translations use appropriate document terminology
- Loaded under `kyc` namespace in `src/i18n/request.ts` via parallel Promise.all

### StepIndicator (`src/components/features/step-indicator.tsx`)
- `currentStep` typed as `number` (was `1 | 2 | 3`) — supports any number of steps
- `variant` prop: `'light' | 'dark'` — dark variant uses white/yellow on dark background for camera overlay screens
- `namespace` prop: defaults to `'auth.register'` — KYC passes `'kyc'` for step label translation
- Backward-compatible: all Phase 2 registration pages work without changes

### Mock KYC Submit API (`src/app/api/mock-kyc/submit/route.ts`)
- POST handler with auth check (401 if no session)
- Validates body with `kycSubmitRequestSchema.safeParse`
- Reads `MOCK_KYC_AUTO_APPROVE` (default: true) and `MOCK_KYC_DELAY_MS` (default: 1500ms)
- Auto-approve path: inserts approved kyc_documents row + updates user_profiles.kyc_status
- Reject path: picks random rejection reason, inserts rejected row, returns `rejection_reasons` array
- Returns `{ success, status, verification_id: 'KYC-{timestamp}' }`
- Try/catch wrapping returns 500 with generic error message on failure

## Deviations from Plan

None — plan executed exactly as written. All files were implemented in a prior execution session; this execution verified all acceptance criteria pass and created the SUMMARY.

## Known Stubs

None — this plan is infrastructure only (schemas, store, i18n, API). No UI components with data stubs.

## Self-Check: PASSED

- [x] `src/lib/kyc/schemas.ts` — FOUND, contains `documentTypeSchema` and `kycSubmissionSchema`
- [x] `src/stores/kyc-store.ts` — FOUND, contains `useKYCStore`, `wave-kyc-state`, `partialize`
- [x] `messages/en/kyc.json` — FOUND, contains `selectDocType`, `status`, `processing`, `expiredModal`
- [x] `messages/th/kyc.json` — FOUND, contains `selectDocType`
- [x] `messages/mm/kyc.json` — FOUND, contains `selectDocType`
- [x] `src/i18n/request.ts` — FOUND, imports kyc namespace
- [x] `src/components/features/step-indicator.tsx` — FOUND, `currentStep: number`, `variant` prop, `namespace` prop
- [x] `src/app/api/mock-kyc/submit/route.ts` — FOUND, contains `POST`, `MOCK_KYC_AUTO_APPROVE`, `kyc_documents`, `user_profiles`
- [x] Commits `afb3994` and `c62a9b3` exist in git log
- [x] `npm run build` passes with no type errors
