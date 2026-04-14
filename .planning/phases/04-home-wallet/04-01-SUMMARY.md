---
phase: "04-home-wallet"
plan: "01"
subsystem: "home-dashboard-infrastructure"
tags: ["api", "swr", "i18n", "navigation", "wallet"]
dependency_graph:
  requires: []
  provides:
    - "GET /api/wallet — returns wallet balance + profile for authenticated user"
    - "GET /api/wallet/transactions — returns last 5 transactions for authenticated user"
    - "useWallet SWR hook with revalidateOnFocus"
    - "useRecentTransactions SWR hook with revalidateOnFocus"
    - "home i18n namespace in 3 locales (en/th/mm)"
    - "BottomNav with yellow active tab indicator (D-11)"
  affects:
    - "src/components/features/wallet-card.tsx (Plan 02 consumer)"
    - "src/components/features/recent-history.tsx (Plan 02 consumer)"
    - "src/app/(main)/home/page.tsx (Plan 02 rebuild)"
tech_stack:
  added:
    - "swr ^2.x — client-side data fetching with revalidateOnFocus"
  patterns:
    - "SWR hooks with typed response interfaces (WalletData, TransactionsData)"
    - "Supabase server client in Next.js Route Handlers via createClient()"
    - "next-intl namespace spread pattern for home messages"
    - "Tailwind border-b-2 active tab indicator with border-transparent fallback for layout"
key_files:
  created:
    - "messages/en/home.json"
    - "messages/th/home.json"
    - "messages/mm/home.json"
    - "src/app/api/wallet/route.ts"
    - "src/app/api/wallet/transactions/route.ts"
    - "src/hooks/use-wallet.ts"
  modified:
    - "src/i18n/request.ts — added home namespace"
    - "src/components/layout/bottom-nav.tsx — yellow active indicator + stroke differentiation"
decisions:
  - "SWR dedupingInterval set to 30000ms (30s) per D-10 to reduce duplicate fetches after focus switches"
  - "Missing wallet row returns null (not 500) — Plan 02 dashboard shows zero state rather than error"
  - "Lucide has no separate filled icon variants — stroke-[2.5] vs stroke-[1.5] provides active/inactive visual weight differentiation without extra imports"
  - "border-transparent on inactive tabs maintains layout consistency with border-b-2 present on all tabs"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 7
  files_modified: 2
---

# Phase 04 Plan 01: Home Dashboard Infrastructure Summary

**One-liner:** Wallet/transaction API routes + SWR hooks with revalidateOnFocus + 3-locale home i18n + yellow active-tab bottom border on BottomNav.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | i18n messages, wallet API routes, and SWR hooks | 705f796 | messages/en/home.json, messages/th/home.json, messages/mm/home.json, src/app/api/wallet/route.ts, src/app/api/wallet/transactions/route.ts, src/hooks/use-wallet.ts, src/i18n/request.ts |
| 2 | Enhance BottomNav with active tab indicator and FAB styling | d93a554 | src/components/layout/bottom-nav.tsx |

## What Was Built

### API Routes
- `GET /api/wallet` — authenticates user via `supabase.auth.getUser()`, queries `wallets` and `user_profiles` tables in parallel, returns `{ wallet, profile }`. Missing wallet row returns `wallet: null` (zero state, not error).
- `GET /api/wallet/transactions` — same auth pattern, queries `transactions` table with `.order('created_at', { ascending: false }).limit(5)`, returns `{ transactions: [] }` on empty (not an error).

### SWR Hooks (`src/hooks/use-wallet.ts`)
- `useWallet()` — `useSWR('/api/wallet', fetcher, { revalidateOnFocus: true, dedupingInterval: 30000 })`
- `useRecentTransactions()` — `useSWR('/api/wallet/transactions', fetcher, { revalidateOnFocus: true, dedupingInterval: 30000 })`
- Both export `mutate` for external revalidation after transaction actions (D-10)
- Typed with `WalletData` and `TransactionsData` interfaces

### i18n Messages
- 3 locale files created: `messages/en/home.json`, `messages/th/home.json`, `messages/mm/home.json`
- All 3 have identical key structure: greeting, balanceHidden, showBalance, hideBalance, copyWalletId, walletIdCopied, walletIdLabel, quickActions.{transfer,bills,referral,withdrawal}, recentHistory.{title,empty.{heading,body}}, promotions.{title,promo1-3.{title,body}}, comingSoon.{heading,body}, errors.{balanceFetch,transactionFetch}, notifications
- `src/i18n/request.ts` updated to load home namespace alongside auth and kyc

### BottomNav Enhancement
- Active tab: `border-b-2 border-wave-yellow` (2px yellow bottom border per D-11)
- Inactive tabs: `border-transparent` (keeps layout stable)
- Active icon: `stroke-[2.5]` — heavier stroke weight for visual differentiation
- Inactive icon: `stroke-[1.5]` — lighter stroke weight
- FAB unchanged: `w-14 h-14 rounded-full bg-wave-yellow shadow-md` with `aria-label="Add Money"` (already correct)
- All touch targets maintain `min-h-[44px]`

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Additional Steps

**SWR Installation** — Package not in dependencies, installed via `npm install swr` before creating hooks file. Tracked as expected work per plan task 1 instructions.

## Known Stubs

None — this plan delivers infrastructure only (API routes, hooks, i18n). No UI rendering components built here. Plan 02 will wire data to WalletCard, RecentHistory, QuickActions, and PromoCarousel components.

## Verification

- `npm run build` — PASS (both `/api/wallet` and `/api/wallet/transactions` appear in build output as dynamic routes)
- home.json key structure validation — PASS
- SWR hooks export useWallet and useRecentTransactions — PASS
- BottomNav has border-b-2, border-wave-yellow, text-wave-blue, bg-wave-yellow — PASS
- All touch targets min-h-[44px] — PASS
- FAB aria-label="Add Money" — PASS

## Self-Check: PASSED
