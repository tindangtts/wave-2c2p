---
phase: 05-transfer-recipients
plan: "03"
subsystem: transfer-flow
tags: [amount-input, channel-selection, currency-conversion, keypad, transfer-store]
dependency_graph:
  requires: ["05-01"]
  provides: ["05-04"]
  affects: [transfer-store, currency-lib]
tech_stack:
  added: []
  patterns:
    - Custom numeric keypad with long-press clear (AmountInput)
    - Debounced live conversion display (100ms)
    - SWR-free rate fetch via useEffect on mount (stored in Zustand)
    - Integer arithmetic: satang -> pya via convertSatangToPya
    - Controlled channel selection with fee schedule constant map
key_files:
  created:
    - src/components/features/amount-input.tsx
    - src/components/features/conversion-card.tsx
    - src/components/features/channel-card.tsx
    - src/app/(main)/transfer/amount/page.tsx
    - src/app/(main)/transfer/channel/page.tsx
  modified: []
decisions:
  - "Long-press backspace (300ms) clears full amount using pointerDown/pointerUp events — compatible with touch and mouse"
  - "Rate fetch uses plain useEffect + fetch (not SWR) since it only runs once on mount and stores in Zustand"
  - "Channel fee schedule defined as const map (D-14 values) — no API call needed for fees"
metrics:
  duration_seconds: 145
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 05 Plan 03: Amount Entry & Channel Selection Summary

**One-liner:** Amount entry page with custom numeric keypad and live MMK conversion plus 4-channel receiving selection with per-channel fee breakdown wired to transfer store.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Amount entry page with custom keypad, live conversion, validation | e422a16 | `amount-input.tsx`, `transfer/amount/page.tsx` |
| 2 | Channel selection page with fee breakdown and conversion card | 0896391 | `conversion-card.tsx`, `channel-card.tsx`, `transfer/channel/page.tsx` |

## What Was Built

### AmountInput Component (`src/components/features/amount-input.tsx`)
- 3x4 numeric keypad (digits 1-9, decimal, 0, backspace)
- Keys are 68x56px, rounded-xl, `#F5F5F5` background with `active:bg-[#E0E0E0]`
- Decimal: only one dot allowed, tracks decimal places (max 2)
- Backspace: removes last char on tap; long-press (300ms) clears entire amount via pointerDown
- Leading zero stripping: "007" → "7"
- Max 8 total characters

### Amount Entry Page (`src/app/(main)/transfer/amount/page.tsx`)
- Guard: redirects to `/transfer/recipient` if no recipient in store
- Exchange rate fetched from `/api/mock-payment/rate` on mount; stored via `setRate(rate, validUntil)`
- Skeleton bar (120x16px) shown while rate loading
- Amount display: 48px bold `#212121`, "THB" suffix 16px `#757575`
- Converted MMK: debounced 100ms, uses `convertSatangToPya(amountSatang, rate)`
- Inline validation: min 100 THB, max 25,000 THB, wallet balance check
- Next button: disabled (gray) when amount=0 or invalid; `setAmount(toSmallestUnit(...))` + navigate to `/transfer/channel`

### ConversionCard Component (`src/components/features/conversion-card.tsx`)
- `bg-[#F5F5F5] rounded-xl p-4` layout
- TH flag emoji + formatted THB → ArrowRight → formatted MMK + MM flag emoji
- Rate line: "1 THB = {rate.toFixed(1)} MMK", 12px `#757575`, centered

### ChannelCard Component (`src/components/features/channel-card.tsx`)
- 4 channels: wave_agent (Store icon), wave_app (Smartphone), bank_transfer (Landmark), cash_pickup (Banknote)
- Channel-specific icon bg colors: E8F5E9, E3F2FD, F3E5F5, FFF3E0
- Selection: 2px `#0091EA` border + `#F0F9FF` bg when selected; 1px `#E0E0E0` when not
- Radio indicator: filled `#0091EA` circle when selected
- `active:scale-[0.98]` press transform

### Channel Selection Page (`src/app/(main)/transfer/channel/page.tsx`)
- Guard: redirects to `/transfer/amount` if amountSatang === 0
- ConversionCard at top with amounts from store
- 4 ChannelCard components in `flex-col gap-3`
- Fee schedule (D-14): wave_agent 10 THB, wave_app 10 THB, bank_transfer 50 THB, cash_pickup 30 THB
- `setChannel(selected)` + `setFee(toSmallestUnit(fee, 'THB'))` on Next tap
- Navigates to `/transfer/confirm`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data flows are wired to transfer store and wallet API.

## Self-Check: PASSED

Files exist:
- src/components/features/amount-input.tsx ✓
- src/components/features/conversion-card.tsx ✓
- src/components/features/channel-card.tsx ✓
- src/app/(main)/transfer/amount/page.tsx ✓
- src/app/(main)/transfer/channel/page.tsx ✓

Commits exist: e422a16 ✓, 0896391 ✓
