# Phase 11: Wallet Operations - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Add 123 Service convenience store top-up channel with Code 128 barcode, bank account CRUD for withdrawals, and Myanmar address cascade pickers for recipient forms. All features extend existing wallet/recipient infrastructure.

</domain>

<decisions>
## Implementation Decisions

### 123 Service Top-up
- Install `react-barcode` (`npm install react-barcode`) — Code 128 format, SVG output
- Tap 123 channel on add-money → new `/add-money/123-service/page.tsx` showing barcode + Ref codes + pay-before timer
- Extend existing `/api/mock-payment/topup` with `channel: '123_service'` — returns ref1, ref2, barcode data, expires_at

### Bank Account Management
- New `bank_accounts` table in Supabase + API routes at `/api/bank-accounts` (GET, POST, DELETE)
- Withdraw page gets bank account selector (dropdown/list) instead of current recipient list. New `/withdraw/add-bank/page.tsx` for adding accounts
- API checks for pending withdrawals before allowing delete (return 409 Conflict)

### Myanmar Address Cascade
- Static JSON file with State → Township → Ward hierarchy (bundled, lazy-loaded via dynamic import)
- Three linked Select dropdowns — selecting State filters Townships, selecting Township filters Wards
- Used in new/edit recipient form for cash_pickup and bank_transfer channels (Myanmar recipients only)

### Claude's Discretion
No items — all decisions resolved.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `add-money/page.tsx` — already has `ConvenienceChannelList` component and channel selection logic
- `withdraw/page.tsx` — currently uses `RecipientList`, needs to switch to bank account selector
- `wallet-ops-store.ts` — has topup and withdraw state (sessionStorage persisted)
- `AmountInput` — reusable for amount entry
- `QrDisplay` — existing QR display (barcode display will follow similar pattern)

### Established Patterns
- Channel selection: tap channel → navigate to channel-specific page with params
- SWR for list fetching, Zustand for flow state
- Mock APIs with env-var-configurable behavior

### Integration Points
- `ConvenienceChannelList` dispatches channel selection → needs to route to 123 Service page
- Withdraw flow: replace RecipientList with BankAccountSelector
- Recipient form (`new-recipient/page.tsx`) needs Myanmar address cascade for Myanmar recipients
- New `bank_accounts` table needs Supabase migration

</code_context>

<specifics>
## Specific Ideas

- Pencil "123 payment" / "123 service" screens show barcode with Ref codes
- Pencil "Add Bank Account" (4 variants) and "Select Bank" screens for withdrawal
- Pencil "State Division", "Township", "Ward and Village" picker screens
- Barcode must be Code 128 (not QR) — convenience store POS scanners require 1D barcodes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
