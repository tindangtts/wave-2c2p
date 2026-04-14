---
phase: "06"
plan: "03"
subsystem: wallet-operations
tags: [history, infinite-scroll, filters, date-picker, buddhist-calendar, transaction-detail]
dependency_graph:
  requires: ["06-01"]
  provides: ["transaction-history-ui", "transaction-detail-ui"]
  affects: ["src/app/(main)/history"]
tech_stack:
  added: []
  patterns:
    - "IntersectionObserver sentinel for infinite scroll trigger"
    - "Buddhist calendar year offset (+543) for Thai locale via formatters.formatCaption"
    - "Date grouping with isToday/isYesterday/format from date-fns"
    - "SWR single-item fetch via id= query param"
key_files:
  created:
    - src/components/features/history-filter-bar.tsx
    - src/components/features/date-range-picker.tsx
    - src/components/features/transaction-row.tsx
    - src/components/features/transaction-detail.tsx
    - src/app/(main)/history/[id]/page.tsx
  modified:
    - src/app/(main)/history/page.tsx
    - src/app/api/transactions/route.ts
decisions:
  - "DateRangePicker uses formatters.formatCaption on shadcn Calendar to inject Buddhist year (+543) for th locale — avoids forking the Calendar component"
  - "IntersectionObserver rootMargin 100px — triggers load before user reaches bottom for smooth experience"
  - "Transactions API extended with id= param returning single object (not array) — minimal API change enabling detail page SWR fetch"
  - "history/[id]/page.tsx uses React.use(params) for async params compatibility with Next.js 16"
  - "Fixed bottom CTA in detail page uses fixed+max-w-[430px]+mx-auto to respect mobile container constraint"
metrics:
  duration_minutes: 4
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 5
  files_modified: 2
---

# Phase 6 Plan 3: Transaction History & Detail Summary

**One-liner:** Transaction history with IntersectionObserver infinite scroll, type/status/date filter chips, Buddhist calendar year display, date-grouped list, and full receipt detail view.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Filter bar, date range picker, transaction row | c067643 | history-filter-bar.tsx, date-range-picker.tsx, transaction-row.tsx |
| 2 | History page, transaction detail page + API | d976d86 | history/page.tsx, history/[id]/page.tsx, transaction-detail.tsx, transactions/route.ts |

## What Was Built

**HistoryFilterBar** (`src/components/features/history-filter-bar.tsx`):
- Full-width DateRangePicker trigger (Row 1)
- Type chips: All / Transfer / Top-up / Withdrawal (Row 2, horizontal scroll)
- Status chips: All / Success / Pending / Failed (Row 3, horizontal scroll)
- Yellow `#FFE600` active / gray `#F5F5F5` inactive chip styling

**DateRangePicker** (`src/components/features/date-range-picker.tsx`):
- shadcn Calendar in Base UI Popover with `mode="range"`
- Buddhist calendar year: `formatters.formatCaption` adds +543 to year when `useLocale() === 'th'`
- Clear button in popover footer; auto-closes on range completion
- Calendar icon trigger with selected range label ("Apr 1 - Apr 14")

**TransactionRow** (`src/components/features/transaction-row.tsx`):
- 40px icon circle with type-specific bg/icon colors (per UI-SPEC D-15)
- send_money: blue `#E3F2FD`/`#0091EA`; add_money: green; withdraw: orange; receive: green
- Credit (+) green `#00C853` / debit (-) red `#F44336` amounts
- Status badge with semantic colors (success/pending/failed)
- Tappable button with `onClick(id)` for navigation

**TransactionDetail** (`src/components/features/transaction-detail.tsx`):
- Status badge centered at top
- Receipt card: 2C2P WAVE logo, Date/Time, Type, Reference No., Description
- Separator, then Amount / Fee (red) / Converted / Total (20px bold)
- Reuses TransferReceipt card pattern

**HistoryPage** (`src/app/(main)/history/page.tsx`):
- `useTransactions(filters)` with type/status/dateFrom/dateTo
- Date-grouped list: "Today" / "Yesterday" / "April 12, 2026" sticky headers
- IntersectionObserver sentinel (100px rootMargin) triggers `setSize(size + 1)`
- 5 skeleton rows on initial load; 3 on next-page loading
- Empty state: filters active vs no transactions yet

**TransactionDetailPage** (`src/app/(main)/history/[id]/page.tsx`):
- `use(params)` for async params (Next.js 16)
- `useSWR('/api/transactions?id={id}')` for single transaction fetch
- 6-row skeleton receipt during loading
- Sticky yellow Close button navigates to /history

**API Extension** (`src/app/api/transactions/route.ts`):
- Added `id=` query param: returns single transaction object via `.single()` (not array)
- User ownership enforced: `.eq('user_id', user.id)` on single-item fetch

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing feature] Added id-based single transaction fetch to transactions API**
- **Found during:** Task 2
- **Issue:** The plan specified fetching single transaction via `/api/transactions?id={id}` but the API only returned paginated arrays
- **Fix:** Added early-return branch in GET handler that calls `.single()` when `id` param is present
- **Files modified:** `src/app/api/transactions/route.ts`
- **Commit:** d976d86

## Known Stubs

None — all components are wired to real data sources (useTransactions SWR hook, transactions API).

## Self-Check: PASSED
