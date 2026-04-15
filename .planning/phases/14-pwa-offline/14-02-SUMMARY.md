---
phase: 14-pwa-offline
plan: "02"
subsystem: pwa
tags: [manifest, icons, offline, install-prompt, pwa]
dependency_graph:
  requires:
    - phase: 14-01
      provides: service-worker-infrastructure
  provides: [web-app-manifest, pwa-icons, offline-fallback, install-prompt]
  affects: [src/app/layout.tsx, src/app/(main)/home/page.tsx]
tech_stack:
  added: [sharp]
  patterns: [MetadataRoute.Manifest, beforeinstallprompt, iOS-detection]
key_files:
  created:
    - src/app/manifest.ts
    - src/app/~offline/page.tsx
    - src/components/pwa/install-prompt.tsx
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - public/icons/icon-180.png
    - public/icons/icon-maskable-512.png
  modified:
    - src/app/layout.tsx
    - src/app/(main)/home/page.tsx
decisions:
  - "app/manifest.ts replaces public/manifest.json — typed App Router convention, auto-served"
  - "Placeholder icons are solid brand-blue (#0091EA) PNGs — user replaces with final branding later"
  - "Install prompt handles Android (beforeinstallprompt) and iOS (Share instructions) separately"
  - "Offline page is a server component with static content — safe for Serwist precache"
requirements-completed: [PWA-01, PWA-05]
metrics:
  duration: "173s"
  completed: "2026-04-15"
  tasks: 3
  files: 10
---

# Phase 14 Plan 02: Manifest, Icons, Offline Page & Install Prompt Summary

Created typed app/manifest.ts (replacing public/manifest.json), generated 4 placeholder PWA icon PNGs, built brand-styled offline fallback page, and install prompt component for both Android Chrome and iOS Safari.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create manifest.ts, icon placeholders, offline page, and install prompt | 8a4a6f9 | src/app/manifest.ts, src/app/~offline/page.tsx, src/components/pwa/install-prompt.tsx, public/icons/icon-*.png |
| 2 | Update layout.tsx and wire install prompt to home page | 416ffea | src/app/layout.tsx, src/app/(main)/home/page.tsx |
| 3 | Verify PWA installability and offline page | — | Human verification checkpoint (auto-approved in autonomous mode) |

## Decisions Made

1. **`app/manifest.ts` over `public/manifest.json`** — App Router typed convention, auto-served at `/manifest.webmanifest`, no manual `<link>` needed
2. **Placeholder icon PNGs** — Solid brand-blue (#0091EA) squares generated programmatically; functional for PWA install, user replaces with final branded assets
3. **Separate icon purposes** — `purpose: "any"` and `purpose: "maskable"` on separate entries (not combined `"any maskable"`)
4. **Install prompt dual-branch** — Android uses `beforeinstallprompt` event; iOS detected via userAgent shows manual Share instructions

## Deviations from Plan

None — all tasks executed as planned.

## Verification Results

- `src/app/manifest.ts` exports MetadataRoute.Manifest with correct fields
- `public/manifest.json` deleted (replaced by manifest.ts)
- All 4 icon PNGs exist in `public/icons/`
- `src/app/~offline/page.tsx` has WifiOff icon and "You are offline" heading
- `src/components/pwa/install-prompt.tsx` handles beforeinstallprompt + iOS detection
- `src/app/(main)/home/page.tsx` imports and renders `<InstallPrompt />`
- `src/app/layout.tsx` has apple-touch-icon, no manifest.json reference

## Self-Check: PASSED

- src/app/manifest.ts: FOUND
- src/app/~offline/page.tsx: FOUND
- src/components/pwa/install-prompt.tsx: FOUND
- public/icons/icon-192.png: FOUND
- Commit 8a4a6f9: FOUND
- Commit 416ffea: FOUND
