# Phase 14: PWA & Offline - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

The app is installable as a PWA and remains functional on spotty or no connectivity through a service worker caching strategy. Covers: Serwist service worker setup, caching strategies (CacheFirst for static assets, NetworkFirst for API routes), web app manifest with icons/splash screen, offline fallback page, and install prompt component.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from PROJECT.md:
- Serwist chosen over next-pwa (unmaintained, broken on Next.js 15+)
- App shell (HTML/CSS/JS): CacheFirst with versioning
- API routes (`/api/mock-*`): NetworkFirst — mock data should always be fresh
- Static assets (icons, fonts): CacheFirst with long TTL
- Do NOT cache Supabase API calls — authentication tokens expire

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Next.js 16.2.3 App Router with proxy.ts
- Tailwind CSS v4 + shadcn/ui design system
- Brand colors: Yellow #FFE600, Blue #0091EA

### Established Patterns
- Mobile-first 430px max container
- Bottom nav layout in (main) route group
- next-intl for i18n (en/th/mm)

### Integration Points
- next.config.ts — Serwist plugin integration point
- public/ — manifest.json, icons, splash screens
- src/app/ — offline fallback page

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
