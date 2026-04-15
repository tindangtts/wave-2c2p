---
phase: 17-features-polish
plan: "01"
subsystem: history
tags: [pdf, statement, download, jspdf, history]
dependency_graph:
  requires: []
  provides: [statement-download-pdf, statement-api]
  affects: [history-page]
tech_stack:
  added: [jspdf@4.2.1, jspdf-autotable@5.0.7]
  patterns: [dynamic-import-client-only, sonner-toast-feedback, next-intl-wallet-namespace]
key_files:
  created:
    - src/app/api/statement/route.ts
    - src/lib/pdf/generate-statement.ts
    - src/components/features/statement-download-button.tsx
  modified:
    - src/app/(main)/history/page.tsx
    - messages/en/wallet.json
    - messages/th/wallet.json
    - messages/mm/wallet.json
    - package.json
decisions:
  - "jspdf-autotable installed as separate package (not bundled in jsPDF 4.x despite research claim)"
  - "English-only PDF labels per research recommendation (no Thai/Myanmar font embedding)"
  - "Dedicated /api/statement route (not reusing paginated /api/transactions)"
metrics:
  duration: 276s
  completed: "2026-04-15"
  tasks_completed: 2
  files_changed: 8
---

# Phase 17 Plan 01: PDF Transaction Statement Download Summary

**One-liner:** Client-side PDF statement download using jsPDF + autoTable with branded yellow headers, triggered from history page date range filter.

## What Was Built

Users can now select a date range on the transaction history page and tap a "Download Statement" button that appears. The button fetches all transactions for the selected range from a dedicated `/api/statement` endpoint (unpaginated, max 500 rows), then generates and downloads a PDF named `statement-{from}-{to}.pdf` entirely client-side using jsPDF.

The PDF contains:
- Header: "2C2P Wave - Transaction Statement"
- Period and generation timestamp
- Table with columns: Date, Description, Type, Amount, Status
- Branded yellow header row (`#FFE600` background, dark text)
- Footer with total transaction count

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install jsPDF, create statement API + PDF generator | 578c8fb | package.json, src/app/api/statement/route.ts, src/lib/pdf/generate-statement.ts |
| 2 | Download button component + history page integration | e18e850 | statement-download-button.tsx, history/page.tsx, 3x wallet.json |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jspdf-autotable is NOT bundled with jsPDF 4.x**
- **Found during:** Task 2 build verification
- **Issue:** Research doc stated "jsPDF 4.x bundles autotable — no separate package needed". Build failed with `Module not found: Can't resolve 'jspdf-autotable'`. Inspecting `node_modules/jspdf/dist/jspdf.es.min.js` confirmed zero autoTable references.
- **Fix:** Installed `jspdf-autotable@5.0.7` as a separate dependency. Side-effect import pattern unchanged.
- **Files modified:** package.json, package-lock.json
- **Commit:** e18e850

**2. [Rule 2 - Missing functionality] Added `downloading` i18n key**
- **Found during:** Task 2 component creation
- **Issue:** Plan specified 3 i18n keys but the button needs a loading state label ("Downloading...") for UX correctness.
- **Fix:** Added `downloading` key to all three locale files (en/th/mm).
- **Files modified:** messages/en/wallet.json, messages/th/wallet.json, messages/mm/wallet.json
- **Commit:** e18e850

## Known Stubs

None. All data is wired through live API calls (`/api/statement`) and real jsPDF generation.

## Self-Check: PASSED

All created files exist on disk. Both task commits (578c8fb, e18e850) found in git log. Build passes with `/history` and `/history/[id]` routes compiled. All 109 tests pass.
