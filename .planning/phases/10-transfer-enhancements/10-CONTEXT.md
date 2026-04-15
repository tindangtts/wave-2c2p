# Phase 10: Transfer Enhancements - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Add P2P wallet-to-wallet transfer (wallet ID + QR), cash pick-up channel with server-generated secret code, e-receipt share/download as PNG image, and recipient favourites toggle with filter. All features extend existing transfer/recipient infrastructure.

</domain>

<decisions>
## Implementation Decisions

### P2P Transfer Architecture
- Separate `p2p-store.ts` with `receiverWalletId`, `amountSatang`, `status` — DO NOT extend existing transfer-store (collision risk per research pitfall)
- Route structure: `/transfer/p2p/page.tsx` (wallet ID entry) → `/transfer/p2p/amount/page.tsx` → reuse existing `/transfer/confirm` and `/transfer/receipt`
- Reuse existing `/scan` page — detect wallet QR format and auto-populate P2P store
- New `/api/mock-payment/p2p-transfer/route.ts` — instant settlement, validates sender≠receiver

### Cash Pick-up + E-Receipt
- Secret code generated server-side in `/api/mock-payment/process-transfer` — 6-digit alphanumeric, returned in response and stored in transaction metadata
- Add `secretCode` field to `TransferReceiptProps` — display in copyable chip with refresh icon
- `html-to-image` library (install: `npm install html-to-image`) — `toPng()` on receipt container div
- Share: `navigator.share()` first (mobile), fallback to download link for desktop browsers

### Recipient Favourites
- `PATCH /api/recipients/[id]` with `{ is_favourite: boolean }` — extend existing route
- Tab pills at top of recipient list ("All" / "Favourites") — consistent with history filter pattern
- Favourites sort to top within each list view, then alphabetical
- Tap star toggles immediately (optimistic update via SWR mutate) — `onToggleFavorite` prop already wired in `RecipientRow`

### Claude's Discretion
No items — all decisions resolved.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `transfer-store.ts` — existing A/C transfer store (DO NOT modify for P2P)
- `TransferReceipt` component — already has Share2 icon, extend with secretCode + share logic
- `RecipientRow` — already has Star icon and `onToggleFavorite` prop wired
- `recipient-list.tsx` — manages list rendering, needs filter tabs
- `PasscodeSheet` — reuse for P2P confirmation
- `AmountInput` — reuse for P2P amount entry
- `ConversionCard` — P2P is THB-only (no conversion needed)
- `RateTimer` — not needed for P2P

### Established Patterns
- Transfer flow: recipient → amount → confirm → passcode → receipt
- SWR hooks for data fetching (`use-recipients`, `use-transactions`, `use-wallet`)
- Zustand stores with session/localStorage persistence
- Mock APIs return configurable responses via env vars

### Integration Points
- `/scan` page needs to detect P2P wallet QR vs other QR types
- Transfer confirm/receipt pages need to handle both A/C and P2P flows
- `recipients` API route needs PATCH method for favourite toggle
- `process-transfer` API needs to return `secretCode` for cash_pickup channel
- New `html-to-image` library — dynamic import with `{ ssr: false }` (browser-only)

</code_context>

<specifics>
## Specific Ideas

- Pencil design "Transfer P2P" section has 11 screens showing the full wallet-to-wallet flow
- Cash pick-up secret code displayed as "047532" style on receipt with copy button
- E-receipt share uses native share sheet on mobile (Web Share API)
- Recipient favourites filter shown as "Recipient List Favorite" in Pencil (2 variants)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
