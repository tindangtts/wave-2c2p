---
phase: 15-qr-scanner-webauthn-migration
plan: "01"
subsystem: qr-scanner
tags: [qr, camera, scanner, live-camera, client-component]
dependency_graph:
  requires: []
  provides: [live-qr-scanner-component, scan-page-live-camera]
  affects: [src/app/(main)/scan/page.tsx, src/components/features/live-scanner.tsx]
tech_stack:
  added: ["@yudiel/react-qr-scanner@^2.5.1"]
  patterns: [yudiel-scanner-wrapper, camera-error-fallback, scan-guard-ref]
key_files:
  created:
    - src/components/features/live-scanner.tsx
  modified:
    - src/app/(main)/scan/page.tsx
    - package.json
decisions:
  - "@yudiel/react-qr-scanner used with finder:false so ScannerFrame provides the overlay"
  - "handledRef guard prevents double-fire of onScan (pitfall documented in research)"
  - "Static import used (not next/dynamic) because scan page is already 'use client'"
  - "NotAllowedError DOMException maps to cameraError state showing gallery-only fallback"
metrics:
  duration: "~4 minutes"
  completed: "2026-04-15T07:09:05Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase 15 Plan 01: QR Scanner — Live Camera Integration Summary

**One-liner:** Replaced manual getUserMedia camera loop with @yudiel/react-qr-scanner, giving the scan page real QR detection via ZXing-WASM polyfill with ScannerFrame overlay.

## What Was Built

- **`src/components/features/live-scanner.tsx`** — `'use client'` wrapper around `<Scanner>` from `@yudiel/react-qr-scanner`. Accepts `onScan`, `onError`, `paused` props. Disables built-in finder overlay (`components={{ finder: false }}`), renders `<ScannerFrame size={240} />` as a sibling. Container uses `position: absolute; inset: 0` styles so video fills parent height without collapsing.

- **`src/app/(main)/scan/page.tsx`** — Replaced ~60 lines of manual camera code (getUserMedia, streamRef, videoRef, CameraState FSM) with `<LiveScanner>`. Added `handledRef` useRef guard to prevent double-scan navigation. Added `scanPaused` state (set true on first scan result). Added `cameraError` state (DOMException NotAllowedError maps to camera-denied fallback). All existing UI chrome preserved: yellow header, X close button, gallery file input, "Upload from Gallery" button, "Receive Money with QR" button. `P2P_WALLET_REGEX` and `handleQRResult` routing logic kept intact.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install @yudiel/react-qr-scanner and create LiveScanner component | 4a63acf | package.json, package-lock.json, live-scanner.tsx |
| 2 | Replace mock camera in scan page with LiveScanner | 639c331 | scan/page.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

- `handleGallerySelect` in scan/page.tsx still uses mock behavior (`handleQRResult('mock-gallery-scan')`). This is intentional — Plan 15-02 wires real BarcodeDetector file-decode for the gallery path. The stub does not block the plan's goal (live camera QR scanning works via LiveScanner).

## Verification Results

- `npm run build` — completed without errors; scan page renders as dynamic route
- `grep -r "getUserMedia" src/app/(main)/scan/` — no results (PASS)
- `grep "LiveScanner" src/app/(main)/scan/page.tsx` — confirmed import and render (PASS)
- `grep "@yudiel/react-qr-scanner" package.json` — confirmed `^2.5.1` dependency (PASS)

## Self-Check: PASSED
