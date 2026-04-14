---
phase: 05-transfer-recipients
plan: "02"
subsystem: transfer-recipients
tags: [recipients, crud, swr, forms, zod, aml-edd]
dependency_graph:
  requires: ["05-01"]
  provides: ["recipient-list-ui", "recipient-selection", "recipient-crud-forms"]
  affects: ["transfer-flow-step-1", "home-quick-actions"]
tech_stack:
  added: []
  patterns: ["SWR optimistic update", "react-hook-form + zod v4", "Base UI DropdownMenu without asChild"]
key_files:
  created:
    - src/hooks/use-recipients.ts
    - src/components/features/recipient-row.tsx
    - src/components/features/recipient-list.tsx
    - src/app/(main)/transfer/recipient/page.tsx
    - src/app/(main)/transfer/new-recipient/page.tsx
    - src/app/(main)/transfer/edit-recipient/[id]/page.tsx
  modified: []
decisions:
  - "Base UI DropdownMenuTrigger has no asChild prop — trigger is rendered directly (className passed to trigger itself), not via asChild+button wrapper"
  - "Favorite star button uses generous padding (-m-[14px] p-[14px]) for 44x44 touch target without visible oversizing"
  - "Edit form loads recipient by ID from SWR cache via useEffect + form.reset() after data arrives, not a separate fetch"
  - "Phone field splits prefix display (+95 badge) from input registration — schema expects full +959... string in combined value"
metrics:
  duration: "5 min"
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 6
  files_modified: 0
---

# Phase 5 Plan 02: Recipient Management UI Summary

**One-liner:** Full recipient CRUD UI — SWR list with optimistic favorite/delete, RecipientRow with star+kebab, sectioned list with search, and scrollable AML/EDD new/edit forms.

## What Was Built

### Task 1: SWR hook, RecipientRow, RecipientList, recipient selection page (commit: cf67a67)

**`src/hooks/use-recipients.ts`**
- `useRecipients()`: SWR hook on `/api/recipients`, same `SWR_OPTIONS` pattern as `use-wallet.ts`
- `toggleFavorite(id, isFavorite, mutate)`: exported helper with optimistic cache update, PATCH to `/api/recipients/{id}`, revert + sonner toast on error

**`src/components/features/recipient-row.tsx`**
- Props: `recipient`, `isSelected`, `onSelect`, `onToggleFavorite`, `onEdit`, `onDelete`
- Yellow 48px circle avatar with first initial, 20px bold `#212121`
- Star icon (Lucide) filled `#0091EA` when favorite, outline `#C0C0C0` otherwise; 44x44 touch target via padding trick
- Kebab menu: `DropdownMenuTrigger` rendered directly (Base UI — no `asChild`), "Edit" and "Delete" items
- Selected state: 3px left border `#FFE600`, `bg-[#FFFDE7]`

**`src/components/features/recipient-list.tsx`**
- Controlled search input with 200ms debounce — filters `full_name` + `transfer_type`
- "Create new recipient" link with `UserPlus` icon in `#0091EA`
- Favorites section + All Recipients section (alphabetical sort)
- Empty state, search-no-results state, 5x skeleton rows during loading
- Delete: `AlertDialog` with recipient name + "This cannot be undone." + red Delete + "Keep Recipient" cancel; optimistic remove + revert on error

**`src/app/(main)/transfer/recipient/page.tsx`**
- `BackHeader` with title from i18n `transfer.title_recipient`, back → `/home`
- `useRecipients()` for data, `useTransferStore()` for `selectedRecipient`/`setRecipient`
- On select: `setRecipient(recipient)` + `router.push('/transfer/amount')`
- Edit handler: `router.push('/transfer/edit-recipient/{id}')`
- Passes `mutate` to `RecipientList` for PATCH/DELETE operations

### Task 2: New recipient form and edit recipient form (commit: 43c7081)

**`src/app/(main)/transfer/new-recipient/page.tsx`**
- 4 sections: Transfer Info, Recipient Identity, Transfer Compliance, Address
- Bank fields (bank_name, account_no) conditionally shown when `transfer_type === 'bank_transfer'`
- All i18n via `useTranslations('transfer')`
- POST to `/api/recipients`; on 201 → `mutate()` + toast + navigate to `/transfer/recipient`
- On 400: Zod field errors mapped to form fields via `form.setError`
- Sticky bottom CTA: yellow rounded-full h-14 with spinner during submit

**`src/app/(main)/transfer/edit-recipient/[id]/page.tsx`**
- Loads recipient from `useRecipients()` cache by ID, `form.reset()` once found
- FormSkeleton while loading, redirect to `/transfer/recipient` if ID not found
- PUT to `/api/recipients/{id}`; on success: `mutate()` + toast + navigate back
- "Save Changes" CTA (vs "Create New" in new form)
- Same field layout and validation as new-recipient form

## Decisions Made

1. **Base UI DropdownMenuTrigger — no asChild**: `@base-ui/react/menu` Trigger component does not support `asChild` prop. className is passed directly to the trigger element.

2. **Favorite touch target via negative margin**: `p-[14px] -m-[14px]` creates 44x44 touch area without visual oversizing — matches established Phase 4 pattern.

3. **Edit form loads from SWR cache**: Rather than a separate `GET /api/recipients/{id}` call, edit form reads from the existing `useRecipients()` cache via `data.recipients.find(r => r.id === id)`. Avoids redundant network request when navigating from the list.

4. **Phone field display split**: The +95 country code is shown as a static badge for visual clarity; the `phone` field is registered as the full `+959...` string per the Zod schema validation pattern.

## Deviations from Plan

None — plan executed exactly as written. TypeScript compiled cleanly on first attempt after one auto-fix: Base UI DropdownMenuTrigger's lack of `asChild` prop (auto-fixed by reading the component source before writing code).

## Requirements Satisfied

- XFER-01: User can select a recipient → persisted in transfer store → navigates to /transfer/amount
- RCPT-01: Recipient list with favorites first, alphabetical all section
- RCPT-02: Search filters both sections (debounced 200ms)
- RCPT-03: Create new recipient with all AML/EDD fields, Zod validation
- RCPT-04: Edit recipient form pre-filled with existing data
- RCPT-05: Delete with AlertDialog confirmation + optimistic remove

## Known Stubs

None. All functionality is wired end-to-end to real API endpoints from Plan 01.

## Self-Check: PASSED

Files created:
- src/hooks/use-recipients.ts — FOUND
- src/components/features/recipient-row.tsx — FOUND
- src/components/features/recipient-list.tsx — FOUND
- src/app/(main)/transfer/recipient/page.tsx — FOUND
- src/app/(main)/transfer/new-recipient/page.tsx — FOUND
- src/app/(main)/transfer/edit-recipient/[id]/page.tsx — FOUND

Commits:
- cf67a67 — feat(05-02): SWR hook, RecipientRow, RecipientList, recipient selection page
- 43c7081 — feat(05-02): new recipient form and edit recipient form
