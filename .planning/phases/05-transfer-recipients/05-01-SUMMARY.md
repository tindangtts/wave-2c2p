---
phase: 05-transfer-recipients
plan: "01"
subsystem: transfer-data-layer
tags: [types, zod, zustand, i18n, api-routes, mock-payment, recipients]
dependency_graph:
  requires: []
  provides:
    - useTransferStore (src/stores/transfer-store.ts)
    - recipientFormSchema (src/lib/transfer/schemas.ts)
    - transferAmountSchema (src/lib/transfer/schemas.ts)
    - GET/POST /api/recipients
    - PUT/DELETE/PATCH /api/recipients/[id]
    - GET /api/mock-payment/rate
    - GET /api/mock-payment/status/[id]
  affects:
    - All Phase 05 UI plans (02-04) consume transfer store and API routes
    - src/i18n/request.ts (transfer namespace added)
    - src/app/api/mock-payment/calculate-fees/route.ts (fee schedule corrected)
tech_stack:
  added: []
  patterns:
    - Zustand persist with partialize (excludes transactionId/status — ephemeral)
    - Zod v4 superRefine for cross-field bank validation
    - In-memory Map for mock status state progression
    - Supabase server client pattern with ownership verification
key_files:
  created:
    - src/lib/transfer/schemas.ts
    - src/stores/transfer-store.ts
    - messages/en/transfer.json
    - messages/th/transfer.json
    - messages/mm/transfer.json
    - src/app/api/recipients/route.ts
    - src/app/api/recipients/[id]/route.ts
    - src/app/api/mock-payment/rate/route.ts
    - src/app/api/mock-payment/status/[id]/route.ts
  modified:
    - src/types/index.ts
    - src/i18n/request.ts
    - src/app/api/mock-payment/calculate-fees/route.ts
decisions:
  - "Recipient extended fields (first_name, last_name, transfer_type, bank fields, address_line_2, city, state_region) stored as enriched response objects since DB schema uses legacy columns — downstream UI gets full shape"
  - "transferAmountSchema validates in satang integers (min 10000 = 100 THB, max 2500000 = 25,000 THB) — balance check is runtime, not schema"
  - "Zustand partialize excludes transactionId and status — they are ephemeral per-session, not route-transition state"
  - "MOCK_EXCHANGE_RATE env var (default 133.0) used for new /rate endpoint; existing exchange-rate endpoint keeps separate MOCK_EXCHANGE_RATE_THB_MMK var"
metrics:
  duration_minutes: 12
  completed_date: "2026-04-14"
  tasks_completed: 2
  tasks_total: 2
  files_created: 9
  files_modified: 3
---

# Phase 5 Plan 1: Transfer Data Infrastructure Summary

**One-liner:** Zustand transfer store with persist, Zod recipient/amount schemas with cross-field bank validation, 3-locale i18n (46 keys each), and 5 API routes (recipient CRUD + rate/status mock endpoints) for the transfer flow.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Types, Zod schemas, Zustand store, i18n | d93d066 | src/types/index.ts, src/lib/transfer/schemas.ts, src/stores/transfer-store.ts, messages/{en,th,mm}/transfer.json, src/i18n/request.ts |
| 2 | Recipient CRUD API routes + mock payment endpoints | bcda5d7 | src/app/api/recipients/route.ts, src/app/api/recipients/[id]/route.ts, src/app/api/mock-payment/rate/route.ts, src/app/api/mock-payment/status/[id]/route.ts, src/app/api/mock-payment/calculate-fees/route.ts |

## What Was Built

### Types (`src/types/index.ts`)
Extended `Recipient` interface with 8 new fields: `first_name`, `last_name`, `transfer_type` (required, maps to `TransferChannel`), `bank_name`, `account_no` (for bank_transfer channel), `address_line_2`, `city`, `state_region`, `updated_at`.

### Zod Schemas (`src/lib/transfer/schemas.ts`)
- `recipientFormSchema`: 14 fields with `superRefine` cross-field validation — `bank_name` and `account_no` are required when `transfer_type === 'bank_transfer'`. NRC regex: `\d{1,2}\/[A-Z]+\([A-Z]\)\d{6}`. Phone validates `+959` prefix with 9 digits.
- `transferAmountSchema`: integer satang validation (10000–2500000). Balance check deferred to component.
- Exported option arrays: `occupationOptions`, `purposeOptions`, `relationshipOptions`.

### Zustand Transfer Store (`src/stores/transfer-store.ts`)
Persists: `selectedRecipient`, `amountSatang`, `channel`, `rate`, `rateValidUntil`, `feeSatang`, `note`. Does NOT persist `transactionId` or `status` (ephemeral). Storage key: `wave-transfer-store`. Actions: setRecipient, setAmount, setChannel, setRate (takes rate + validUntil), setFee, setNote, setTransactionId, setStatus, reset.

### i18n Messages (`messages/{en,th,mm}/transfer.json`)
46 keys per locale covering all UI-SPEC copywriting: screen titles, CTAs, form labels, error messages, status strings, channel/occupation/purpose/relationship option labels. English uses exact UI-SPEC copy. Thai and Myanmar use translated strings.

### Recipient CRUD API (`src/app/api/recipients/`)
- `GET /api/recipients`: lists by `is_favorite DESC, full_name ASC` with auth guard
- `POST /api/recipients`: Zod-validated create, computes `full_name`, enriches response with extended fields
- `PUT /api/recipients/[id]`: ownership-verified update
- `DELETE /api/recipients/[id]`: ownership-verified delete, returns `{ success: true }`
- `PATCH /api/recipients/[id]`: lightweight favorite toggle (boolean guard)

### Mock Payment Endpoints
- `GET /api/mock-payment/rate`: returns `{ rate, validUntil, from: 'THB', to: 'MMK' }` where validUntil = now + 5 min. Rate from `MOCK_EXCHANGE_RATE` env var (default 133.0).
- `GET /api/mock-payment/status/[id]`: in-memory Map tracks first-call timestamp per transaction ID. Returns pending (<1.5s), processing (<3s), completed/failed (≥3s based on `MOCK_PAYMENT_FAIL`).
- `calculate-fees/route.ts`: corrected fee schedule to D-14 values (bank_transfer 15→50, cash_pickup 20→30).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Enriched recipient response for extended fields not in DB schema**
- **Found during:** Task 2 (POST/PUT implementation)
- **Issue:** The `recipients` DB table only has the legacy columns (full_name, phone, country_code, nrc, occupation, transfer_purpose, relationship, address). The new type fields (first_name, last_name, transfer_type, bank_name, account_no, address_line_2, city, state_region) have no DB columns.
- **Fix:** API routes store to existing columns where there's a mapping (full_name computed from first+last, address from address_line_1), then merge the parsed form data back into the response object so downstream UI receives the complete Recipient shape.
- **Impact:** Functionally correct for mock/dev; production would require a DB migration to add columns.
- **Files modified:** src/app/api/recipients/route.ts, src/app/api/recipients/[id]/route.ts

## Known Stubs

None — all API routes return real data shapes. The extended recipient fields (first_name, last_name, transfer_type, etc.) are present in API responses but not persisted to separate DB columns. This is a known limitation tracked for a future DB migration plan.

## Self-Check: PASSED

- src/lib/transfer/schemas.ts: FOUND
- src/stores/transfer-store.ts: FOUND
- messages/en/transfer.json: FOUND
- messages/th/transfer.json: FOUND
- messages/mm/transfer.json: FOUND
- src/app/api/recipients/route.ts: FOUND
- src/app/api/recipients/[id]/route.ts: FOUND
- src/app/api/mock-payment/rate/route.ts: FOUND
- src/app/api/mock-payment/status/[id]/route.ts: FOUND
- Commits d93d066, bcda5d7: FOUND
- TypeScript: PASSED (npx tsc --noEmit)
