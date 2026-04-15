---
phase: 11-wallet-operations
plan: "04"
subsystem: transfer/recipients
tags: [myanmar-address, cascade-select, recipient-form, address-picker]
dependency_graph:
  requires:
    - "src/lib/transfer/schemas.ts (recipientFormSchema with address fields)"
    - "src/components/ui/select.tsx (shadcn Select)"
  provides:
    - "myanmar-address-data.ts: static hierarchical address data for Myanmar"
    - "MyanmarAddressPicker: controlled cascade dropdown component"
    - "Integrated in new-recipient and edit-recipient forms"
  affects:
    - "src/app/(main)/transfer/new-recipient/page.tsx"
    - "src/app/(main)/transfer/edit-recipient/[id]/page.tsx"
tech_stack:
  added: []
  patterns:
    - "Cascade select pattern: state change resets township+ward; township change resets ward"
    - "Controlled component pattern: MyanmarAddress state lifted to page, form.setValue syncs to RHF"
    - "Conditional rendering: MyanmarAddressPicker shown for cash_pickup/bank_transfer, plain Inputs for other types"
key_files:
  created:
    - src/lib/transfer/myanmar-address-data.ts
    - src/components/features/myanmar-address-picker.tsx
  modified:
    - src/app/(main)/transfer/new-recipient/page.tsx
    - src/app/(main)/transfer/edit-recipient/[id]/page.tsx
decisions:
  - "isMyanmarRecipient condition covers both cash_pickup and bank_transfer transfer types — both involve Myanmar recipients with structured administrative addresses"
  - "Kept plain Input fields for wave_app/wave_agent types — those transfer types do not require Myanmar administrative address hierarchy"
  - "Myanmar address picker initializes from loaded recipient in edit-recipient useEffect — avoids separate useEffect hook"
  - "onValueChange guards against null per project decision (Base UI Select onValueChange can receive null)"
metrics:
  duration_seconds: 166
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_changed: 4
---

# Phase 11 Plan 04: Myanmar Address Cascade Picker Summary

Myanmar address cascade picker (State/Division → Township → Ward/Village) as a shared controlled component, integrated into both recipient forms for Myanmar transfer types.

## What Was Built

**myanmar-address-data.ts** — Static hierarchical address data for all 15 Myanmar administrative divisions (14 states/regions + Naypyitaw Union Territory). Each state has 2–5 townships; each township has 3–5 wards/villages. Exports `MYANMAR_STATES`, `getTownships(stateName)`, and `getWards(stateName, townshipName)`.

**MyanmarAddressPicker** (`src/components/features/myanmar-address-picker.tsx`) — A controlled `'use client'` component rendering 3 linked Select dropdowns. Selecting State resets Township and Ward. Selecting Township resets Ward. Township dropdown is disabled until State is selected. Ward dropdown is disabled until Township is selected. All null-guards applied per project decision.

**new-recipient integration** — For `cash_pickup` and `bank_transfer` transfer types, the four plain address Input fields are replaced by `<MyanmarAddressPicker>`. Picker `onChange` calls `form.setValue` to sync `state_region`, `city`, and `address_line_1`. For other types (`wave_app`, `wave_agent`), plain Input fields remain.

**edit-recipient integration** — Same `isMyanmarRecipient` logic and `MyanmarAddressPicker` section. The existing `useEffect` that loads recipient data was extended to call `setMyanmarAddress({ state: found.state_region, township: found.city, ward: found.address })` so the picker pre-loads the existing values.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 0952092 | feat(11-04): create myanmar-address-data.ts with 15 states/divisions |
| Task 2 | 14a31a5 | feat(11-04): add MyanmarAddressPicker and integrate into recipient forms |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all address data is real Myanmar administrative geography data.

## Self-Check: PASSED
