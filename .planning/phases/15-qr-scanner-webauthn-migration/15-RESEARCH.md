# Phase 15: QR Scanner & WebAuthn Migration - Research

**Researched:** 2026-04-15
**Domain:** React QR scanning (camera + file-input), Supabase SQL migration for WebAuthn columns
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
All implementation choices are at Claude's discretion — infrastructure/integration phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from PROJECT.md:
- @yudiel/react-qr-scanner chosen for live camera QR scanning
- File-input fallback needed for iOS PWA camera limitations
- WebAuthn columns: credential_id, public_key, counter, challenge on user_profiles
- Existing WebAuthn API routes from Phase 13 (v1.1) must work with new DB columns

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure/integration phase.

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QR-01 | User can scan QR codes using live camera via @yudiel/react-qr-scanner | Scanner component API documented; `onScan` callback receives `IDetectedBarcode[]`; `barcode-detector` polyfill bundled handles iOS via WASM |
| QR-02 | Scanned QR auto-detects type (wallet ID for P2P, payment code for receive) | Wallet ID regex already in mock page (`/^W-\d{6,}$/`); `rawValue` from IDetectedBarcode is the decoded string to test |
| DB-01 | WebAuthn columns applied to user_profiles without data loss | All 4 columns referenced in Phase 13 API routes; SQL uses `ADD COLUMN IF NOT EXISTS` pattern established in Phase 02 migration |
| DB-02 | Biometric enrollment works on deployed HTTPS domain with installed PWA | WebAuthn requires HTTPS (or localhost); `NEXT_PUBLIC_DOMAIN` and `NEXT_PUBLIC_APP_ORIGIN` env vars must be set on deploy; existing routes are complete and correct |
</phase_requirements>

## Summary

Phase 15 has two unrelated workstreams that can be implemented independently: (1) replace the mock scan page with a live `@yudiel/react-qr-scanner` component, and (2) apply the WebAuthn SQL migration to the Supabase `user_profiles` table.

For the QR scanner, the existing `scan/page.tsx` already contains the correct video/camera plumbing and UI chrome. The entire camera acquisition logic (getUserMedia, stream management, cameraState FSM) can be replaced by a single `<Scanner>` component from `@yudiel/react-qr-scanner`. The library bundles `barcode-detector@3.0.8` (ZXing-WASM polyfill) and `webrtc-adapter@9.0.3`, so it works on iOS Safari via polyfill — no separate polyfill installation needed. The file-input fallback for iOS PWA users (who cannot use live camera after navigating to the page) must be built separately because `@yudiel/react-qr-scanner` does not expose image/file decode — the fallback must use a hidden `<input type="file">` that reads the image on canvas and passes pixel data through `BarcodeDetector` directly. The QR type detection regex (`/^W-\d{6,}$/`) already exists in the mock page and must be preserved.

For the WebAuthn migration, the API routes in `src/app/api/auth/webauthn/` already reference four columns (`webauthn_credential_id`, `webauthn_public_key`, `webauthn_counter`, `webauthn_challenge`) that do not exist in `supabase-schema.sql`. The migration is a straightforward `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` block (matching the Phase 02 pattern). No data loss risk because the columns are new and nullable. DB-02 is not a code change — it requires setting `NEXT_PUBLIC_DOMAIN` and `NEXT_PUBLIC_APP_ORIGIN` correctly on the deployed environment.

**Primary recommendation:** Replace scan page by swapping the manual camera setup for `<Scanner constraints={{ facingMode: 'environment' }} onScan={handleScan} components={{ finder: false }} />` wrapped inside the existing visual chrome; add file-input fallback using native BarcodeDetector; add the SQL migration block to `supabase-schema.sql`.

## Project Constraints (from CLAUDE.md)

| Directive | Details |
|-----------|---------|
| Next.js 16.2.3 + App Router | Use `proxy.ts` not `middleware.ts`; all async APIs await |
| Mobile-first 430px | Touch targets 44x44px min; safe area handling |
| `@yudiel/react-qr-scanner` locked | Already decided — do not substitute |
| Mock services pattern | `isDemoMode` bypass required in any API route |
| TypeScript strict | No `any`, explicit return types |
| Tailwind CSS v4 | No Tailwind v3 syntax |
| `'use client'` | Scanner component must be a Client Component |
| HTTPS required for WebAuthn | DB-02 only verifiable on deployed domain |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @yudiel/react-qr-scanner | 2.5.1 (latest) | Live camera QR scanning | Pre-decided in CLAUDE.md; bundles ZXing-WASM polyfill for iOS |
| barcode-detector (bundled) | 3.0.8 (transitive) | BarcodeDetector API polyfill | Auto-included by @yudiel/react-qr-scanner — no separate install |
| @simplewebauthn/browser | 13.3.0 (installed) | Client-side WebAuthn credential creation | Already installed Phase 13 |
| @simplewebauthn/server | 13.3.0 (installed) | Server-side WebAuthn verification | Already installed Phase 13 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native BarcodeDetector API | Browser built-in | File-input QR decode fallback | For gallery image decode — @yudiel doesn't expose this, call directly |
| Supabase SQL migration | — | ADD COLUMN IF NOT EXISTS | Phase 15-03: WebAuthn columns |

**Installation:**
```bash
npm install @yudiel/react-qr-scanner
```

**Version verification (confirmed 2026-04-15):**
- `@yudiel/react-qr-scanner`: 2.5.1

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(main)/scan/
│   └── page.tsx              # Replace: mount <LiveScanner>, keep visual chrome
├── components/features/
│   └── live-scanner.tsx      # New: @yudiel/react-qr-scanner wrapper (Client Component)
└── .planning/
    └── supabase-schema.sql   # Append: Phase 15 WebAuthn migration block
```

### Pattern 1: Scanner Component API

**What:** `<Scanner>` from `@yudiel/react-qr-scanner` renders a `<video>` element with built-in camera acquisition, frame capture, and barcode detection. `onScan` fires with `IDetectedBarcode[]` on each successful decode.

**When to use:** The primary live-camera scanning path on all platforms.

**Key props:**
```typescript
// Source: https://github.com/yudielcurbelo/react-qr-scanner README
import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner'

<Scanner
  constraints={{ facingMode: 'environment' }}
  formats={['qr_code']}
  onScan={(codes: IDetectedBarcode[]) => {
    const value = codes[0]?.rawValue
    if (value) handleQRResult(value)
  }}
  onError={(err) => console.error('[Scanner]', err)}
  paused={isPaused}
  scanDelay={300}
  components={{ finder: false }}   // Disable built-in overlay — we use ScannerFrame
  styles={{ container: { width: '100%', height: '100%' } }}
/>
```

`IDetectedBarcode` shape:
```typescript
interface IDetectedBarcode {
  rawValue: string       // The decoded QR string — this is the routing input
  format: string         // e.g. 'qr_code'
  boundingBox: { x: number; y: number; width: number; height: number }
  cornerPoints: { x: number; y: number }[]
}
```

### Pattern 2: File-Input Fallback (iOS PWA)

**What:** `@yudiel/react-qr-scanner` does NOT support decoding from a static image/file. The file-input fallback must use the native `BarcodeDetector` API (which is polyfilled by the `barcode-detector` package bundled with `@yudiel/react-qr-scanner`).

**When to use:** When the user taps "Upload from Gallery" — iOS PWA may not support live camera after navigation.

```typescript
// Source: MDN BarcodeDetector API + barcode-detector polyfill docs
async function decodeImageFile(file: File): Promise<string | null> {
  // barcode-detector polyfill is already loaded by @yudiel/react-qr-scanner
  // It registers BarcodeDetector on globalThis if not natively available
  const detector = new BarcodeDetector({ formats: ['qr_code'] })
  const bitmap = await createImageBitmap(file)
  const results = await detector.detect(bitmap)
  return results[0]?.rawValue ?? null
}
```

**iOS note:** `createImageBitmap` is supported in iOS Safari 15+. For iOS 14 fallback, draw to canvas first:
```typescript
async function decodeImageFileFallback(file: File): Promise<string | null> {
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.src = url
  await new Promise<void>((resolve) => { img.onload = () => resolve() })
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  canvas.getContext('2d')!.drawImage(img, 0, 0)
  URL.revokeObjectURL(url)
  try {
    const detector = new BarcodeDetector({ formats: ['qr_code'] })
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!)))
    const bmp = await createImageBitmap(blob)
    const results = await detector.detect(bmp)
    return results[0]?.rawValue ?? null
  } catch {
    return null
  }
}
```

### Pattern 3: QR Type Detection Logic

**What:** After getting `rawValue`, determine which flow to route to.

**When to use:** In `handleQRResult` — called from both live scan and file-input fallback.

```typescript
// Existing regex from scan/page.tsx — preserve this
const P2P_WALLET_REGEX = /^W-\d{6,}$/

// Payment code: add-money QR channel values use a different format
// Check existing add-money/qr route to understand what payment codes look like
// Based on codebase: /add-money/qr?channel=...&amount=...  (not a scannable QR format)
// The "payment code" QR in this app = the wallet ID on receive-qr page
// Treat: wallet ID match → P2P; everything else → toast or ignore

function handleQRResult(value: string, router: AppRouterInstance, setReceiverWalletId: (id: string) => void) {
  const trimmed = value.trim()
  if (P2P_WALLET_REGEX.test(trimmed)) {
    setReceiverWalletId(trimmed)
    router.push('/transfer/p2p/amount')
  } else {
    // Non-P2P QR — show decoded value or handle payment code
    toast.info(`QR: ${trimmed}`)
  }
}
```

**Important finding:** The existing `receive-qr/page.tsx` generates a QR code whose value is just the raw `wallet_id` string (e.g. `W-abc123def456`). There is no distinct "payment code" format in the current codebase — both the wallet scan and "receive money" QR produce the same wallet ID format. The `P2P_WALLET_REGEX` already handles this. QR-02 is satisfied by the wallet-ID detection alone; no additional payment-code branch is needed unless a separate format is added.

### Pattern 4: WebAuthn SQL Migration

**What:** Append a Phase 15 migration block to `supabase-schema.sql` using the established `ADD COLUMN IF NOT EXISTS` idempotency pattern from Phase 02.

**Column mapping from Phase 13 API routes:**

| SQL Column | Type | Used In |
|------------|------|---------|
| `webauthn_credential_id` | `text` | register/verify writes; authenticate/verify reads; profile page reads/clears |
| `webauthn_public_key` | `text` | register/verify writes (base64url); authenticate/verify reads |
| `webauthn_counter` | `bigint DEFAULT 0` | register/verify writes; authenticate/verify updates |
| `webauthn_challenge` | `text` | register writes; register/verify clears; authenticate writes; authenticate/verify clears |

```sql
-- =============================================================================
-- Phase 15 WebAuthn Migration
-- Add WebAuthn credential columns to user_profiles
-- Referenced by: api/auth/webauthn/register/, authenticate/
-- All columns nullable — no existing rows affected
-- =============================================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS webauthn_credential_id text,
  ADD COLUMN IF NOT EXISTS webauthn_public_key text,
  ADD COLUMN IF NOT EXISTS webauthn_counter bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS webauthn_challenge text;
```

### Anti-Patterns to Avoid
- **Hand-rolling BarcodeDetector polyfill:** `@yudiel/react-qr-scanner` already bundles `barcode-detector@3.0.8` — do not add a second polyfill import.
- **Importing Scanner in a Server Component:** `@yudiel/react-qr-scanner` uses browser APIs; must be inside a `'use client'` component or dynamically imported with `ssr: false`.
- **Dynamic import with `ssr: false` pattern (Next.js `next/dynamic`):** Since the entire scan page is already `'use client'`, a simple static import of the Scanner component is sufficient — no need for `dynamic()`.
- **Keeping the manual getUserMedia loop:** Remove it entirely; `@yudiel/react-qr-scanner` manages the camera stream internally. Retaining it creates two competing camera streams.
- **Using `ADD COLUMN` without `IF NOT EXISTS`:** Migration fails on re-run. Always use `IF NOT EXISTS` (established project pattern).
- **Setting `NEXT_PUBLIC_DOMAIN` to include `https://`:** `rpID` for WebAuthn must be the bare hostname only (e.g. `wave.example.com` not `https://wave.example.com`). `NEXT_PUBLIC_APP_ORIGIN` includes the protocol.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Camera acquisition + frame decode | Custom getUserMedia + canvas frame extraction + ZXing decode loop | `@yudiel/react-qr-scanner` `<Scanner>` | ZXing-WASM polyfill, webrtc-adapter, requestAnimationFrame loop, iOS playsInline — all handled internally |
| BarcodeDetector polyfill | Manual polyfill script | `barcode-detector` (bundled as transitive dep) | Already in node_modules via @yudiel; calling `new BarcodeDetector()` in file-input path automatically uses polyfill |
| WebAuthn credential storage format | Custom encoding/schema | Existing routes use `isoBase64URL.fromBuffer` / `isoBase64URL.toBuffer` from `@simplewebauthn/server/helpers` | Already implemented correctly in Phase 13; migration just adds columns to match |

## Runtime State Inventory

> Phase 15 is an integration/migration phase. Runtime state audit is required for the WebAuthn migration workstream.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `user_profiles` table in Supabase: 4 WebAuthn columns referenced in code but NOT in schema | SQL migration — `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for all 4 columns |
| Live service config | Supabase project schema managed via Supabase Dashboard SQL Editor | Run migration SQL manually in Supabase Dashboard (or via `supabase db push` if migrations dir exists) |
| OS-registered state | None — no OS-level registrations involved | None |
| Secrets/env vars | `NEXT_PUBLIC_DOMAIN` and `NEXT_PUBLIC_APP_ORIGIN` must be set on deployed environment for WebAuthn to work | Set in Vercel/hosting env vars — not a code change |
| Build artifacts | None | None |

**Nothing found in category:** Stored data (QR scanner — no runtime state change), OS-registered state, Secrets/env (QR workstream), Build artifacts.

## Common Pitfalls

### Pitfall 1: Scanner Renders Outside Viewport
**What goes wrong:** `@yudiel/react-qr-scanner` renders a `<video>` inside a container div. If the container has no explicit height, the video collapses to zero height.
**Why it happens:** The component doesn't impose height by default; it respects parent layout.
**How to avoid:** Pass `styles={{ container: { position: 'absolute', inset: 0, width: '100%', height: '100%' } }}` and ensure the parent has `position: relative` and `flex-1` or explicit height.
**Warning signs:** Black screen with no error; camera permission granted but nothing visible.

### Pitfall 2: Double-Fire of onScan
**What goes wrong:** `onScan` fires multiple times for the same QR code during a single hold, causing duplicate navigation pushes.
**Why it happens:** `scanDelay` default is 500ms and `allowMultiple` defaults to false, but the same code is detected on the next cycle after the delay.
**How to avoid:** Set `paused` to `true` immediately in the `handleScan` callback, before calling `router.push`. Use a `useRef` guard: `const scanHandled = useRef(false)`.
**Warning signs:** Double-navigation or app goes to a page and immediately navigates again.

### Pitfall 3: iOS Safari — Camera Permissions Re-prompt
**What goes wrong:** iOS Safari re-prompts for camera permission each time the user navigates to the scan page.
**Why it happens:** Safari grants camera permission per-page-visit in PWA installed mode under some configurations.
**How to avoid:** The existing scan page already handles this correctly (permission state FSM: `requesting → active | denied | unavailable`). The `@yudiel/react-qr-scanner` `onError` callback receives the `NotAllowedError` and should be mapped to the `denied` state to show the file-input fallback UI.
**Warning signs:** User sees repeated permission prompts; the `onError` fires with `DOMException: NotAllowedError`.

### Pitfall 4: BarcodeDetector Not Available in File-Input Path
**What goes wrong:** `new BarcodeDetector()` throws `ReferenceError: BarcodeDetector is not defined` when called in the file-input handler.
**Why it happens:** The `barcode-detector` polyfill from `@yudiel/react-qr-scanner` is loaded lazily — it may not be registered globally until the `<Scanner>` component mounts.
**How to avoid:** Import the polyfill explicitly at the top of the file-input handler module if BarcodeDetector is undefined: `if (!('BarcodeDetector' in window)) { await import('barcode-detector/ponyfill') }`.
**Warning signs:** Gallery scan silently fails; `window.BarcodeDetector` is undefined in console.

### Pitfall 5: WebAuthn rpID Mismatch
**What goes wrong:** WebAuthn enrollment fails with `SecurityError: The relying party ID is not a registrable domain suffix of...`
**Why it happens:** `NEXT_PUBLIC_DOMAIN` is set to `https://wave.example.com` instead of `wave.example.com`.
**How to avoid:** `rpID` must be the bare hostname, no protocol, no trailing slash. `NEXT_PUBLIC_APP_ORIGIN` includes the protocol: `https://wave.example.com`.
**Warning signs:** Registration fails immediately on deployed domain; error in browser console references relying party ID.

### Pitfall 6: SSR Import of @yudiel/react-qr-scanner
**What goes wrong:** Build error or runtime crash: `ReferenceError: navigator is not defined` during SSR.
**Why it happens:** The library accesses browser APIs at module load time.
**How to avoid:** The scan page is already `'use client'` — this is sufficient. Do NOT attempt to use in a Server Component.
**Warning signs:** `next build` succeeds but page crashes on first render; error mentions `navigator`.

## Code Examples

### Live Scanner Component (verified API)
```typescript
// Source: https://github.com/yudielcurbelo/react-qr-scanner README
'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { useP2PStore } from '@/stores/p2p-store'
import { ScannerFrame } from '@/components/features/scanner-frame'

const P2P_WALLET_REGEX = /^W-\d{6,}$/

export function LiveScanner() {
  const router = useRouter()
  const { setReceiverWalletId } = useP2PStore()
  const [paused, setPaused] = useState(false)
  const handledRef = useRef(false)

  function handleScan(codes: IDetectedBarcode[]) {
    const value = codes[0]?.rawValue
    if (!value || handledRef.current) return
    handledRef.current = true
    setPaused(true)

    const trimmed = value.trim()
    if (P2P_WALLET_REGEX.test(trimmed)) {
      setReceiverWalletId(trimmed)
      router.push('/transfer/p2p/amount')
    } else {
      // Handle other QR types
    }
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <Scanner
        constraints={{ facingMode: 'environment' }}
        formats={['qr_code']}
        onScan={handleScan}
        onError={(err) => console.error('[Scanner]', err)}
        paused={paused}
        scanDelay={300}
        components={{ finder: false }}
        styles={{
          container: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
          video: { width: '100%', height: '100%', objectFit: 'cover' },
        }}
      />
      <ScannerFrame size={240} />
    </div>
  )
}
```

### File-Input Fallback with BarcodeDetector
```typescript
// Source: MDN BarcodeDetector API; barcode-detector polyfill README
async function decodeQRFromFile(file: File): Promise<string | null> {
  try {
    // Ensure polyfill is available (loaded by @yudiel/react-qr-scanner)
    if (!('BarcodeDetector' in window)) {
      const { BarcodeDetector: BDPoly } = await import('barcode-detector/pure')
      // @ts-expect-error polyfill assignment
      window.BarcodeDetector = BDPoly
    }
    const detector = new BarcodeDetector({ formats: ['qr_code'] })
    const bitmap = await createImageBitmap(file)
    const results = await detector.detect(bitmap)
    return results[0]?.rawValue ?? null
  } catch {
    return null
  }
}
```

### WebAuthn SQL Migration Block
```sql
-- =============================================================================
-- Phase 15 WebAuthn Migration
-- Add WebAuthn credential columns to user_profiles
-- Run in: Supabase Dashboard > SQL Editor, or: supabase db push
-- Idempotent: ADD COLUMN IF NOT EXISTS — safe to re-run
-- =============================================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS webauthn_credential_id text,
  ADD COLUMN IF NOT EXISTS webauthn_public_key text,
  ADD COLUMN IF NOT EXISTS webauthn_counter bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS webauthn_challenge text;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual getUserMedia + canvas frame loop | `@yudiel/react-qr-scanner` handles internally | Phase 15 | Remove ~60 lines of manual camera code from scan/page.tsx |
| ZXing.js for decoding | ZXing-WASM via `barcode-detector` polyfill | 2023-2024 | WASM is faster, no JS interop overhead |
| `html5-qrcode` / older libs | `@yudiel/react-qr-scanner` 2.x | 2024+ | Smaller bundle, maintained, iOS-compatible |

**Current state of scan/page.tsx:** The page manually opens a camera stream via `getUserMedia`, renders a `<video>` element, and has NO actual QR decoding — it only shows the camera feed. The `handleQRResult` function exists with the correct P2P routing logic but is never triggered by real QR data. Phase 15-01 replaces the manual camera block with `<Scanner>`; Phase 15-02 wires QR detection routing.

## Open Questions

1. **Payment code QR format**
   - What we know: `receive-qr/page.tsx` generates a QR from raw `wallet_id` (e.g. `W-abc123`). The existing P2P regex handles this.
   - What's unclear: The ROADMAP mentions "payment code → add-money flow" as a separate QR type, but no distinct payment code format exists in the codebase.
   - Recommendation: Treat all `W-\d{6,}` QRs as P2P wallet scans. For the "payment code" branch, add a placeholder `else` that shows a toast with the decoded value — defer a distinct payment-code format to a future phase if needed.

2. **supabase db push vs manual SQL Editor**
   - What we know: `supabase` CLI 2.84.2 is installed. No `/supabase/migrations/` directory exists in the repo.
   - What's unclear: Whether the project uses local Supabase migration tracking or manual SQL Editor.
   - Recommendation: The migration SQL block appended to `supabase-schema.sql` serves as the authoritative record. The plan should instruct running it via Supabase Dashboard SQL Editor (matching all prior phases).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, dev server | ✓ | v25.8.1 | — |
| @yudiel/react-qr-scanner | QR-01 | ✗ (not yet installed) | 2.5.1 on npm | — |
| supabase CLI | DB-01 migration apply | ✓ | 2.84.2 | Manual SQL Editor in Supabase Dashboard |
| HTTPS domain | DB-02 WebAuthn enrollment | ✗ (local only) | — | Localhost works for Chrome testing; HTTPS required for deployed biometrics |
| BarcodeDetector (native) | QR-01 file fallback | Browser-dependent | — | `barcode-detector` polyfill (bundled with @yudiel) |

**Missing dependencies with no fallback:**
- None that block code implementation. `@yudiel/react-qr-scanner` must be installed before 15-01 can be executed.

**Missing dependencies with fallback:**
- HTTPS domain: local dev via `localhost` works for Chrome; Safari on iOS requires HTTPS for WebAuthn. DB-02 can only be fully verified on a deployed domain.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.4 (installed, not yet configured — Phase 16 sets up) |
| Config file | none — Wave 0 in Phase 16 |
| Quick run command | `npm test` (once Phase 16 sets up vitest.config.ts) |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QR-01 | Scanner mounts and calls onScan with decoded value | manual-only (camera hardware) | — | N/A |
| QR-02 | P2P_WALLET_REGEX correctly matches wallet IDs; handleQRResult routes correctly | unit | `npm test -- qr-detection` | ❌ Wave 0 |
| DB-01 | WebAuthn columns exist in user_profiles after migration | manual-only (Supabase Dashboard) | — | N/A |
| DB-02 | Biometric enrollment succeeds on HTTPS | manual-only (deployed domain) | — | N/A |

**Note:** QR-01, DB-01, DB-02 require hardware/infrastructure — not automatable. QR-02 detection logic (`P2P_WALLET_REGEX`, routing branch) is unit-testable but the test infrastructure (Phase 16) does not yet exist. The planner may choose to skip Wave 0 test scaffolding for Phase 15 since Phase 16 handles the full test setup.

### Wave 0 Gaps
- Optional: `tests/unit/qr-detection.test.ts` — covers QR-02 regex and routing logic
- Framework install deferred to Phase 16 (`npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react`)

*(If the planner includes a Wave 0 test task in 15-02, it should be minimal: just the regex unit test. Full framework setup belongs in Phase 16.)*

## Sources

### Primary (HIGH confidence)
- @yudiel/react-qr-scanner GitHub README — props API, IDetectedBarcode type, IScannerComponents, examples
- `src/app/api/auth/webauthn/register/route.ts` — exact column names used in code
- `src/app/api/auth/webauthn/register/verify/route.ts` — column write pattern
- `src/app/api/auth/webauthn/authenticate/verify/route.ts` — column read + update pattern
- `.planning/supabase-schema.sql` — Phase 02 migration pattern (`ADD COLUMN IF NOT EXISTS`)
- `src/app/(main)/scan/page.tsx` — existing regex, routing logic, UI chrome to preserve

### Secondary (MEDIUM confidence)
- npm registry: `@yudiel/react-qr-scanner@2.5.1` transitive deps (`barcode-detector@3.0.8`, `webrtc-adapter@9.0.3`) — confirmed via `npm view`
- [MDN BarcodeDetector](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) — file-decode pattern, browser compatibility
- [Can I Use: BarcodeDetector](https://caniuse.com/mdn-api_barcodedetector) — iOS limited native support, polyfill needed

### Tertiary (LOW confidence)
- iOS PWA camera re-prompt behavior — documented in CLAUDE.md AGENTS.md pitfalls section; not independently re-verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm version confirmed, GitHub README API verified
- Architecture: HIGH — based on actual codebase code audit
- Pitfalls: MEDIUM — camera/iOS pitfalls from CLAUDE.md + community sources; WebAuthn pitfalls HIGH (from spec)
- SQL migration: HIGH — pattern directly from existing schema file

**Research date:** 2026-04-15
**Valid until:** 2026-07-15 (stable libraries; @yudiel may release breaking changes)
