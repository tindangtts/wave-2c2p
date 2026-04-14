---
phase: "04-home-wallet"
plan: "02"
subsystem: "home-dashboard"
tags: ["dashboard", "wallet", "carousel", "transactions", "i18n", "swr"]
dependency_graph:
  requires: ["04-01"]
  provides: ["home-dashboard-ui", "wallet-card", "quick-actions", "recent-history", "promo-carousel"]
  affects: ["home-page", "bills-page", "referral-page", "withdrawal-page"]
tech_stack:
  added: ["embla-carousel-react (direct usage)"]
  patterns: ["SWR client islands", "localStorage hydration pattern (SSR-safe)", "Embla dot sync via onSelect callback"]
key_files:
  created:
    - src/app/(main)/bills/page.tsx
    - src/app/(main)/referral/page.tsx
    - src/app/(main)/withdrawal/page.tsx
  modified:
    - src/components/features/wallet-card.tsx
    - src/components/features/quick-actions.tsx
    - src/components/features/recent-history.tsx
    - src/components/features/promo-carousel.tsx
    - src/components/layout/top-header.tsx
    - src/app/(main)/home/page.tsx
decisions:
  - "Embla carousel used directly (not shadcn wrapper) for precise dot indicator sync via onSelect callback"
  - "localStorage hydration uses useState(true) + useEffect pattern to prevent SSR mismatch"
  - "withdrawal/page.tsx created as new Coming Soon placeholder at /withdrawal route (separate from existing /withdraw scaffold)"
  - "Badge component className overrides used for custom status colors (bg-[#E8F5E9] etc.) since shadcn Badge lacks named variants for all status states"
metrics:
  duration: "8 minutes"
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_modified: 9
---

# Phase 04 Plan 02: Home Dashboard Feature Components Summary

**One-liner:** Complete home dashboard with SWR-powered WalletCard (balance toggle + wallet ID copy), 2x2 QuickActions grid, transaction RecentHistory with status badges, Embla PromoCarousel with dot sync, and Coming Soon placeholder pages for Bills/Referral/Withdrawal.

## What Was Built

### Task 1: WalletCard, QuickActions, TopHeader

**WalletCard** (`src/components/features/wallet-card.tsx`):
- Removed prop-based API; component fetches data via `useWallet()` SWR hook
- Balance show/hide toggle with `Eye`/`EyeOff` icons, 44px touch targets
- localStorage persistence using `useState(true)` + `useEffect` pattern (SSR-safe, prevents hydration mismatch)
- `formatCurrency(wallet.balance, 'THB')` for formatted balance display
- Masked wallet ID: `WAVE-XXXX-XXXX` from last 8 chars of UUID
- Clipboard copy with sonner toast "Wallet ID copied", 2s duration, bottom-center position
- Skeleton loading state (yellow-tinted `bg-[#FDD835]`) during SWR fetch
- Error state showing `t('errors.balanceFetch')` text

**QuickActions** (`src/components/features/quick-actions.tsx`):
- Exactly 4 actions in `grid-cols-2` layout (removed More Features button and 5-column layout)
- Blue circles: `w-12 h-12 rounded-full bg-[#0091EA]` with white icons
- Actions: Transfer (`/transfer`), Bills (`/bills`), Referral (`/referral`), Withdrawal (`/withdrawal`)
- `active:scale-95 transition-transform` press state on each cell
- 72px minimum touch target, `aria-label` on each Link

**TopHeader** (`src/components/layout/top-header.tsx`):
- Bell button with `min-w-[44px] min-h-[44px]` touch target and `aria-label={t('notifications')}`
- Switched from `<Link>` to `<button>` per accessibility requirements
- Yellow `bg-[#FFE600]` header with `h-14` (56px) height

### Task 2: RecentHistory, PromoCarousel, Placeholder Pages, Home Wiring

**RecentHistory** (`src/components/features/recent-history.tsx`):
- Uses `useRecentTransactions()` SWR hook (removed mock data)
- Type icon mapping: `ArrowUpRight` (send/bill/red), `ArrowDownLeft` (receive/green), `Plus` (add/green), `Minus` (withdraw/red)
- Status badge mapping with colored backgrounds per UI-SPEC: success=green, pending/processing=amber, rejected/failed=red
- Credit/debit amount coloring: `text-[#00C853]` for credits, `text-[#F44336]` for debits
- 5 skeleton rows during loading, error state with tap-to-retry `mutate()`
- Empty state: "No transactions yet" heading + body text
- `CirclePlus` icon linking to `/history` in section header
- Transaction rows NOT wrapped in Link (read-only Phase 4)
- `divide-y divide-gray-100` row separators

**PromoCarousel** (`src/components/features/promo-carousel.tsx`):
- Direct `useEmblaCarousel` from `embla-carousel-react` (not shadcn wrapper)
- `loop: false`, `align: 'start'`
- 3 gradient cards: `bg-gradient-to-r from-[#0091EA] to-[#01579B]`, 160px height, `flex-[0_0_80%] max-w-[340px]`
- Dot indicators synced via `emblaApi.on("select", onSelect)`: active `#FFE600`, inactive `#E0E0E0`
- Dots are decorative only (no tap-to-navigate)
- i18n text from `useTranslations('home').promotions.*`

**Placeholder pages:**
- `src/app/(main)/bills/page.tsx`: Coming Soon with Receipt icon
- `src/app/(main)/referral/page.tsx`: Coming Soon with Users icon
- `src/app/(main)/withdrawal/page.tsx`: Coming Soon with ArrowDownLeft icon
- All use `router.back()` for navigation, yellow back header matching brand

**Home Page** (`src/app/(main)/home/page.tsx`):
- Pure Server Component (no 'use client' — all client logic in islands)
- Layout: TopHeader → yellow bg WalletCard → `-mt-4` QuickActions → `mt-6` RecentHistory → `mt-6` PromoCarousel
- WalletCard takes no props (self-contained SWR island)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added /withdrawal Coming Soon page (separate from existing /withdraw)**
- **Found during:** Task 2
- **Issue:** QuickActions links to `/withdrawal` but only `/withdraw` existed (a Phase 6 scaffold). Without `/withdrawal`, the link would 404.
- **Fix:** Created `src/app/(main)/withdrawal/page.tsx` as a Coming Soon placeholder at the `/withdrawal` route
- **Files modified:** `src/app/(main)/withdrawal/page.tsx`
- **Commit:** d04febc

**2. [Rule 1 - Bug] Badge className override pattern used for status colors**
- **Found during:** Task 2
- **Issue:** shadcn Badge has `success`, `warning`, `info` variants but not the specific hex colors required by UI-SPEC (e.g., `#00C853` text on `#E8F5E9` bg). The existing success variant uses `text-[#212121]` not `text-[#00C853]`.
- **Fix:** Pass `className` overrides with explicit hex colors and `border-0` to the Badge component, which merges with `cn()` internally
- **Files modified:** `src/components/features/recent-history.tsx`
- **Commit:** d04febc

## Known Stubs

None. All components wire to live SWR hooks. Promo cards use i18n keys (not placeholders). The only "mock" content is the promo card copy itself, which is intentional per D-08 ("Mock cards") and the UI-SPEC copywriting contract.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 654aa0c | feat(04-02): rewrite WalletCard, QuickActions, and TopHeader components |
| Task 2 | d04febc | feat(04-02): RecentHistory, PromoCarousel, placeholder pages, home page wiring |

## Self-Check: PASSED
