# Phase 14: PWA & Offline - Research

**Researched:** 2026-04-15
**Domain:** Progressive Web App, Service Workers, Serwist, Web App Manifest
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Serwist chosen over next-pwa (unmaintained, broken on Next.js 15+)
- App shell (HTML/CSS/JS): CacheFirst with versioning
- API routes (`/api/mock-*`): NetworkFirst — mock data should always be fresh
- Static assets (icons, fonts): CacheFirst with long TTL
- Do NOT cache Supabase API calls — authentication tokens expire

### Claude's Discretion
All other implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

### Deferred Ideas (OUT OF SCOPE)
None — infrastructure phase.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PWA-01 | App installs as PWA on mobile with proper manifest, icons, and splash screen | manifest.json already exists at `public/manifest.json`; needs icon-192.png and icon-512.png generated; apple-touch-icon meta needed in layout.tsx |
| PWA-02 | App shell (HTML/CSS/JS) is cached for offline access via service worker | Serwist precache via `self.__SW_MANIFEST`; CacheFirst for app shell routes |
| PWA-03 | Static assets (icons, fonts) use CacheFirst strategy with long TTL | CacheFirst handler with ExpirationPlugin; matcher on `request.destination === "image"` and `"font"` |
| PWA-04 | API routes use NetworkFirst strategy with offline fallback message | NetworkFirst handler matched on `/api/` pathname; offline fallback page at `public/offline.html` |
| PWA-05 | User sees install prompt when visiting on mobile browser | `beforeinstallprompt` for Android Chrome; iOS Safari requires manual instructions via a custom banner component |
</phase_requirements>

---

## Summary

Phase 14 adds PWA installability and offline resilience to the 2C2P Wave app. The two-plan split is clean: Plan 14-01 covers the Serwist service worker (the hard infrastructure), and Plan 14-02 covers the manifest, icons, offline fallback page, and install prompt UI (the visible PWA surface).

The critical decision already made — Serwist — is the right choice. `next-pwa` is unmaintained and broken on Next.js 15+. Serwist 9.5.7 is actively maintained (published within the last 14 days as of research date) and supports Next.js 14+.

**The most important technical complication:** Next.js 16 uses Turbopack by default for `next dev`, but `@serwist/next` (webpack variant) does NOT support Turbopack. Two viable paths exist:
1. Use `@serwist/next` (webpack) and add `--webpack` flag to `dev` script for PWA testing only
2. Use `@serwist/turbopack` which has a different API (route handler instead of plugin, `SerwistProvider` wrapper)

Given that the project's `dev` script is already `next dev` (no `--turbo` flag), and `next build` is webpack by default, `@serwist/next` (webpack path) is the lower-friction option. The `--webpack` flag only matters during `next dev` when you want to test the service worker — you can disable Serwist in development entirely.

**Primary recommendation:** Use `@serwist/next` (webpack variant) with `disable: process.env.NODE_ENV === 'development'` so the service worker never interferes with dev hot reload. Production builds use webpack by default and work with no extra flags.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @serwist/next | 9.5.7 | Webpack plugin wrapping Serwist for Next.js | Officially chosen, actively maintained, Next.js 14+ support |
| serwist | 9.5.7 | Service worker runtime (CacheFirst, NetworkFirst, etc.) | Same package family, provides strategy classes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @serwist/turbopack | 9.5.7 | Alternative if full Turbopack dev support needed | Only if team requires live Turbopack dev + service worker testing simultaneously |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @serwist/next (webpack) | @serwist/turbopack | Turbopack variant has different API (SerwistProvider, createSerwistRoute) — more setup, but avoids --webpack flag |
| @serwist/next | next-pwa | Unmaintained, broken on Next.js 15+ |
| @serwist/next | Manual Workbox | High complexity, Serwist wraps this correctly |

**Installation (webpack path):**
```bash
npm i @serwist/next && npm i -D serwist
```

**Version verification:** Both `@serwist/next` and `serwist` are at 9.5.7 — verified via `npm view` on 2026-04-15.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── sw.ts              # Service worker entry (compiled to public/sw.js)
│   └── ~offline/
│       └── page.tsx       # Offline fallback page (App Router route)
public/
├── manifest.json          # Already exists — needs icons updated
├── sw.js                  # Generated by Serwist build (gitignored)
├── swe-worker*.js         # Generated by Serwist build (gitignored)
├── offline.html           # Alternative: static HTML fallback (avoids SW precache issue)
└── icons/
    ├── icon-192.png       # Required for manifest
    ├── icon-512.png       # Required for manifest
    ├── icon-180.png       # apple-touch-icon (iOS home screen)
    └── icon-maskable.png  # Maskable icon (safe zone: inner 80%)
components/
└── pwa/
    └── install-prompt.tsx # 'use client' — beforeinstallprompt + iOS instructions banner
```

### Pattern 1: Serwist Plugin Configuration (next.config.ts)
**What:** Wrap the existing Next.js config with Serwist's webpack plugin
**When to use:** Production builds; disabled in development to avoid cache interference

```typescript
// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(withNextIntl(nextConfig));
// Source: https://serwist.pages.dev/docs/next/getting-started
```

### Pattern 2: Service Worker Entry (src/app/sw.ts)
**What:** The compiled service worker with explicit caching strategies per PROJECT.md rules
**When to use:** Defines all caching behavior — must be precise to avoid caching Supabase auth tokens

```typescript
// src/app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Static assets: CacheFirst with long TTL
    {
      matcher: ({ request }) =>
        request.destination === "image" || request.destination === "font",
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          }),
        ],
      }),
    },
    // Mock API routes: NetworkFirst (data must stay fresh)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/mock-"),
      handler: new NetworkFirst({
        cacheName: "mock-api",
        networkTimeoutSeconds: 10,
      }),
    },
    // Supabase API: NetworkOnly — NEVER cache auth tokens
    {
      matcher: ({ url }) => url.hostname.includes("supabase.co"),
      handler: new NetworkFirst({
        cacheName: "supabase-never",
        networkTimeoutSeconds: 0, // No fallback — must go to network
      }),
    },
    // Default Next.js cache (RSC, JS, CSS)
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
// Source: https://serwist.pages.dev/docs/next/getting-started + https://serwist.pages.dev/docs/serwist/runtime-caching/caching-strategies/network-first
```

### Pattern 3: Offline Fallback Page
**What:** A page served when the user is offline and the document is not cached
**When to use:** Navigation requests that miss the cache

The Serwist discussion (#174) reveals that **Next.js App Router pages cannot be directly precached** because dynamic RSC responses conflict with the precache manifest. The solution is:
- Create `src/app/~offline/page.tsx` (the tilde prefix is the Serwist convention for App Router)
- Register it in `additionalPrecacheEntries` in `next.config.ts` with a `revision` string
- The page renders a static "you are offline" message with brand styling

```typescript
// next.config.ts withSerwistInit options
{
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision: "1" }],
  disable: process.env.NODE_ENV === "development",
}
```

### Pattern 4: Install Prompt Component
**What:** Client component that captures `beforeinstallprompt` (Android Chrome) and shows iOS instructions
**When to use:** Rendered in the home page or root layout; hides when already installed (standalone mode)

```typescript
// src/components/pwa/install-prompt.tsx
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps (official Next.js guide)
'use client';
import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone) return null;
  // Render install button (Android) or iOS instructions banner
}
```

### Pattern 5: Web App Manifest (manifest.json)
**What:** Already exists at `public/manifest.json`; needs icons populated and moved to `app/manifest.ts` (App Router preferred)
**When to use:** App Router supports `app/manifest.ts` as a typed metadata route; avoids manual `<link>` tags

Existing `public/manifest.json` uses `display: standalone`, `theme_color: #0091EA`, and `start_url: /home` — these are correct. The missing piece is the actual icon PNG files and a `maskable` purpose entry.

### Anti-Patterns to Avoid
- **Caching Supabase calls:** Auth tokens expire; cached responses will cause silent auth failures. Use `url.hostname.includes("supabase.co")` to exclude them.
- **Precaching Next.js App Router pages directly:** Dynamic RSC responses cannot be precached reliably; use `additionalPrecacheEntries` with a static revision string and a route that renders static content.
- **Enabling Serwist in development:** The service worker will serve stale cached responses during development, masking code changes. Always set `disable: process.env.NODE_ENV === "development"`.
- **`purpose: "any maskable"` on a single icon:** Causes too much padding on some platforms. Use two separate icon entries: one with `purpose: "any"` and one with `purpose: "maskable"`.
- **Using `next dev` (Turbopack) to test service worker:** `@serwist/next` webpack plugin does not run under Turbopack. To test PWA locally, run `next dev --webpack` or `next build && next start`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker caching logic | Custom fetch event handler | Serwist (CacheFirst, NetworkFirst, ExpirationPlugin) | Cache expiry, quota management, opaque response handling are all complex edge cases |
| SW manifest precache list | Manual asset list | `self.__SW_MANIFEST` (injected by Serwist build plugin) | Automatically generated with content hashes for cache busting |
| SW registration | Manual `navigator.serviceWorker.register` in layout | Serwist handles registration via the webpack plugin output | Correct scope, update lifecycle, and `skipWaiting`/`clientsClaim` handled |

**Key insight:** Service worker caching has many non-obvious failure modes (opaque responses, quota exceeded, SW update lifecycle) that Workbox/Serwist handles. Never build this from scratch.

---

## Runtime State Inventory

> SKIPPED — greenfield infrastructure phase. No rename/refactor involved.

---

## Common Pitfalls

### Pitfall 1: Turbopack vs Webpack Confusion
**What goes wrong:** Developer runs `next dev` (Turbopack) and the service worker never appears; thinks Serwist is broken.
**Why it happens:** `@serwist/next` is a webpack plugin; Turbopack doesn't run webpack plugins.
**How to avoid:** Set `disable: process.env.NODE_ENV === "development"` in `withSerwistInit`. Test the service worker only with `next build && next start` or `next dev --webpack`.
**Warning signs:** `public/sw.js` is not generated after build; DevTools > Application > Service Workers shows nothing.

### Pitfall 2: iOS Safari Install Prompt
**What goes wrong:** Team tests install prompt on Android Chrome (which has `beforeinstallprompt`), ships, and iOS users see nothing.
**Why it happens:** iOS Safari does NOT fire `beforeinstallprompt`. Users must manually use the Share > Add to Home Screen flow.
**How to avoid:** The install prompt component must have two branches: `beforeinstallprompt` for Android, and a manual instruction banner for iOS (detected via `navigator.userAgent`).
**Warning signs:** PWA-05 passes on Android but iOS users report no prompt.

### Pitfall 3: Supabase Auth Token Caching
**What goes wrong:** Serwist caches a Supabase API response with an expired JWT; all subsequent requests return 401 silently.
**Why it happens:** `defaultCache` in `@serwist/next/worker` may match third-party origins including Supabase.
**How to avoid:** Add an explicit `NetworkFirst` (or `NetworkOnly`) rule for `url.hostname.includes("supabase.co")` BEFORE the `...defaultCache` spread in the `runtimeCaching` array. Order matters — first match wins.
**Warning signs:** Auth works fresh but fails after going offline/online; Supabase requests return cached 401 responses.

### Pitfall 4: Offline Fallback Page Precache Loop
**What goes wrong:** Using a Next.js RSC page as the fallback URL causes the service worker to enter an infinite precache loop or throw on install.
**Why it happens:** RSC pages have dynamic RSC payload responses that the precache mechanism cannot deterministically cache.
**How to avoid:** Either (a) use `additionalPrecacheEntries: [{ url: "/~offline", revision: "1" }]` with a static-content App Router page, or (b) use a plain `public/offline.html` static file.
**Warning signs:** Service worker install fails in DevTools console with "bad-precaching-response" errors.

### Pitfall 5: Plugin Ordering in next.config.ts
**What goes wrong:** Wrapping `withSerwist(withNextIntl(nextConfig))` vs `withNextIntl(withSerwist(nextConfig))` — one order may cause the intl plugin to miss rewrites injected by Serwist.
**Why it happens:** Each wrapper adds webpack config transforms; Serwist needs to see the final config.
**How to avoid:** Apply Serwist as the outermost wrapper: `export default withSerwist(withNextIntl(nextConfig))`.
**Warning signs:** SW precache manifest is empty; i18n routing breaks after adding Serwist.

---

## Code Examples

### tsconfig.json additions for Serwist
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    "types": ["@serwist/next/typings"]
  },
  "exclude": ["public/sw.js", "public/swe-worker*.js"]
}
// Source: https://serwist.pages.dev/docs/next/getting-started
```

### .gitignore additions
```
# Serwist generated service worker files
public/sw.js
public/sw.js.map
public/swe-worker*.js
public/swe-worker*.js.map
```

### manifest.json (updated with maskable icons)
```json
{
  "name": "2C2P Wave",
  "short_name": "Wave",
  "description": "Mobile banking and cross-border remittance",
  "start_url": "/home",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#0091EA",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### iOS apple-touch-icon in layout.tsx (already partially present)
The `layout.tsx` already has `appleWebApp: { capable: true, ... }`. Add the apple-touch-icon link:
```typescript
// In metadata export in layout.tsx — icons field
icons: {
  apple: [
    { url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' },
  ],
},
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-pwa` (shadowwalker) | Serwist `@serwist/next` | 2023 (next-pwa abandoned) | next-pwa broken on Next.js 15+; Serwist is the maintained successor |
| `public/sw.js` manual | `src/app/sw.ts` compiled by Serwist | Serwist introduction | TypeScript service workers with full type safety |
| `next dev --turbo` for everything | `next dev --webpack` for PWA testing | Next.js 16 default Turbopack | Serwist webpack plugin incompatible with Turbopack dev mode |
| Manual `<link rel="manifest">` | `app/manifest.ts` typed route | Next.js App Router | Auto-served at `/manifest.webmanifest` with correct headers |

**Deprecated/outdated:**
- `next-pwa` (shadowwalker/next-pwa): Unmaintained, last meaningful update 2022, broken on Next.js 15+
- `next-offline` (hanford): Abandoned
- Manual `public/sw.js` without build tooling: No precache manifest injection, no cache busting

---

## Open Questions

1. **Icon PNG files**
   - What we know: `public/icons/` contains only SVG navigation icons; no `icon-192.png` or `icon-512.png` exist yet
   - What's unclear: Whether the brand SVG at `/icons/logo-2c2p-wave.svg` should be converted to PNG programmatically or if static PNGs need to be manually created
   - Recommendation: Plan 14-02 must include generating/placing at minimum `icon-192.png`, `icon-512.png`, `icon-180.png` (apple-touch-icon), and `icon-maskable-512.png`. Use `pwa-asset-generator` as a dev tool, or create placeholder branded PNGs directly in the plan.

2. **`app/manifest.ts` vs `public/manifest.json`**
   - What we know: `public/manifest.json` already exists with correct brand colors and start_url; Next.js App Router supports `app/manifest.ts` as a typed metadata route
   - What's unclear: Migrating to `app/manifest.ts` removes the need for `<link rel="manifest">` in layout.tsx (Next.js injects it automatically), but risks a double-manifest if both exist
   - Recommendation: Delete `public/manifest.json` and create `app/manifest.ts` — App Router convention is cleaner and typed.

3. **Turbopack dev workflow**
   - What we know: `@serwist/next` does not support Turbopack; `next dev` in Next.js 16 uses Turbopack by default
   - What's unclear: Whether the team needs to test the service worker during development or only in production builds
   - Recommendation: Set `disable: process.env.NODE_ENV === "development"`. Add a `"dev:pwa": "next dev --webpack"` script for the rare case of local SW testing.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Serwist build | ✓ | (system) | — |
| npm | Package install | ✓ | (system) | — |
| @serwist/next | PWA-02, PWA-03, PWA-04 | ✗ (not yet installed) | 9.5.7 on npm | — |
| serwist | Runtime caching | ✗ (not yet installed) | 9.5.7 on npm | — |

**Missing dependencies with no fallback:**
- `@serwist/next` and `serwist` — must be installed in Wave 0 of Plan 14-01.

**Missing dependencies with fallback:**
- None.

**Note on icon PNGs:** `icon-192.png`, `icon-512.png`, `icon-180.png`, `icon-maskable-512.png` do not exist in `public/icons/`. They must be created in Plan 14-02. No runtime dependency — static files.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (installed in devDependencies) |
| Config file | No `vitest.config.ts` detected — Wave 0 of Phase 16 creates it |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWA-01 | Manifest served with correct fields | manual | DevTools > Application > Manifest | N/A |
| PWA-02 | App shell loads from cache offline | manual | DevTools > Network > Offline | N/A |
| PWA-03 | Static assets served CacheFirst | manual | DevTools > Application > Cache Storage | N/A |
| PWA-04 | API routes use NetworkFirst, offline fallback shown | manual | DevTools > Network > Offline + navigate to `/home` | N/A |
| PWA-05 | Install prompt appears | manual | Visit on mobile Chrome (Android) or check iOS instructions | N/A |

**Note:** PWA service worker behavior is inherently a manual/browser test concern. These requirements cannot be meaningfully tested with Vitest unit tests. Playwright E2E could verify manifest file existence and basic SW registration, but full offline cache behavior requires DevTools simulation. Phase 16 (TEST-04, TEST-05) covers Playwright E2E for auth and transfer flows; PWA-specific browser tests are out of scope for that phase.

### Sampling Rate
- **Per task commit:** `npx next build` — verify no TypeScript errors, `public/sw.js` generated
- **Per wave merge:** Manual browser test: install PWA on Chrome Android (or use Chrome DevTools Application panel)
- **Phase gate:** All 5 success criteria from ROADMAP verified manually before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No Vitest config exists yet (Wave 0 of Phase 16 addresses this — not blocking Phase 14)
- [ ] PWA tests are manual-only; no automated test files needed for this phase

*(No automated test gaps — PWA behavior is verified via browser/DevTools)*

---

## Sources

### Primary (HIGH confidence)
- [Serwist @serwist/next Getting Started](https://serwist.pages.dev/docs/next/getting-started) — plugin config, sw.ts template, navigation fallback
- [Serwist Turbopack Quick Guide](https://serwist.pages.dev/docs/next/turbo) — Turbopack alternative path
- [Serwist CacheFirst docs](https://serwist.pages.dev/docs/serwist/runtime-caching/caching-strategies/cache-first) — strategy API
- [Serwist NetworkFirst docs](https://serwist.pages.dev/docs/serwist/runtime-caching/caching-strategies/network-first) — strategy API
- [Next.js Official PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — manifest.ts, InstallPrompt pattern, iOS instructions
- `npm view @serwist/next version` — confirmed 9.5.7 on 2026-04-15

### Secondary (MEDIUM confidence)
- [LogRocket: Next.js 16 PWA with Serwist](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) — --webpack flag for dev, withSerwistInit options, confirmed against official docs
- [Aurora Scharff: Dynamic PWA Icons with Next.js 16 + Serwist](https://aurorascharff.no/posts/dynamically-generating-pwa-app-icons-nextjs-16-serwist/) — Turbopack limitation confirmed
- [Serwist Discussion #174](https://github.com/serwist/serwist/discussions/174) — App Router offline fallback page cannot be directly precached; use static route or public HTML
- [MDN: Making PWAs Installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) — beforeinstallprompt, iOS limitations
- [DEV: Building Offline Apps with Serwist](https://dev.to/sukechris/building-offline-apps-with-nextjs-and-serwist-2cbj) — sw.ts runtimeCaching patterns

### Tertiary (LOW confidence)
- None. All key claims verified from primary or secondary sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm version confirmed, official docs verified
- Architecture: HIGH — official Serwist docs + Next.js official PWA guide
- Pitfalls: HIGH — Turbopack issue confirmed by multiple sources + GitHub issue #54; Supabase caching pitfall verified from auth token expiry behavior

**Research date:** 2026-04-15
**Valid until:** 2026-07-15 (stable APIs; Serwist releases infrequently)
