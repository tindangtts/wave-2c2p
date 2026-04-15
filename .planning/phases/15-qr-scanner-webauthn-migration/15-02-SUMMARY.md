---
phase: 15-qr-scanner-webauthn-migration
plan: "02"
subsystem: qr-scanner
tags: [qr, detection, routing, gallery, barcode-detector, p2p]
dependency_graph:
  requires: [live-qr-scanner-component]
  provides: [qr-type-detection-module, gallery-qr-decode, p2p-wallet-routing]
  affects:
    - src/app/(main)/scan/page.tsx
    - src/lib/qr-detection.ts
tech_stack:
  added: []
  patterns: [qr-detection-discriminated-union, barcode-detector-dynamic-polyfill, gallery-file-decode]
key_files:
  created:
    - src/lib/qr-detection.ts
  modified:
    - src/app/(main)/scan/page.tsx
decisions:
  - "P2P_WALLET_REGEX moved to shared qr-detection module so it can be unit-tested independently in Phase 16"
  - "detectQRType returns discriminated union (not boolean) enabling exhaustive type checking at call sites"
  - "decodeQRFromFile uses dynamic polyfill import (barcode-detector/pure) only when native BarcodeDetector absent — avoids double-polyfill with @yudiel bundled version"
  - "ts-expect-error removed from BarcodeDetector constructor call — TS lib.dom.d.ts already types it"
metrics:
  duration: "~3 minutes"
  completed: "2026-04-15T07:12:29Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 15 Plan 02: QR Detection Module & Gallery Decode Summary

**One-liner:** Extracted QR type detection to a shared module with typed routing logic and wired real BarcodeDetector file-decode for gallery image uploads.

## What Was Built

- **`src/lib/qr-detection.ts`** — New shared module exporting `P2P_WALLET_REGEX`, `QRType` discriminated union, `detectQRType(rawValue)`, and `decodeQRFromFile(file)`. The `detectQRType` function returns `{ type: 'p2p_wallet', walletId }` or `{ type: 'unknown', rawValue }` — fully typed with no string comparisons at call sites. `decodeQRFromFile` checks for native `BarcodeDetector`, lazily imports `barcode-detector/pure` polyfill if absent, and uses `createImageBitmap` + `detector.detect()` for real QR extraction from gallery images. No top-level browser imports — SSR safe.

- **`src/app/(main)/scan/page.tsx`** — Updated to import `detectQRType` and `decodeQRFromFile` from `@/lib/qr-detection`. Inline `P2P_WALLET_REGEX` removed. `handleScanResult` now uses `detectQRType` for routing: wallet QRs navigate to `/transfer/p2p/amount`; unknown QRs show `toast.info('QR: ...')` and reset the scanner state (handledRef + scanPaused) so the user can scan again. `handleGallerySelect` now calls `decodeQRFromFile` for real image decode with `toast.error('No QR code found in image')` on failure.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create QR detection module with type routing and file decode | 722d419 | src/lib/qr-detection.ts |
| 2 | Wire QR detection module into scan page | 77996ef | scan/page.tsx, qr-detection.ts (fix) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused @ts-expect-error on BarcodeDetector constructor**
- **Found during:** Task 1 build verification
- **Issue:** Plan instructed adding `@ts-expect-error` before `new BarcodeDetector()` call, but TypeScript's `lib.dom.d.ts` already types `BarcodeDetector` — the directive became an error (unused directive causes build failure)
- **Fix:** Removed the `@ts-expect-error` comment; also removed the unnecessary `as string | undefined` cast since TypeScript correctly inferred the type
- **Files modified:** src/lib/qr-detection.ts
- **Commit:** 77996ef (included in Task 2 commit as the fix was applied before that commit)

## Known Stubs

None — all functionality is wired to real implementations.

## Verification Results

- `npm run build` — succeeded without TypeScript errors
- `grep -r "P2P_WALLET_REGEX" src/lib/qr-detection.ts` — regex confirmed in module
- `grep -r "P2P_WALLET_REGEX" src/app/(main)/scan/page.tsx` — returns nothing (removed from page)
- `grep "decodeQRFromFile" src/app/(main)/scan/page.tsx` — confirmed import and usage in handleGallerySelect

## Self-Check: PASSED
