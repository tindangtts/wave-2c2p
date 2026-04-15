# Phase 17: Features & Polish - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (discuss skipped)

<domain>
## Phase Boundary

Users can download a PDF of their transaction history for any date range, and can view and adjust their personal spending limits from the profile. Two standalone features that extend existing pages.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints:
- PDF generation: use jsPDF or similar lightweight library
- Statement download integrates with existing transaction history page (date range filter already exists)
- Spending limits: API route (GET/PATCH) + profile menu entry + screen with tier selector
- Follow existing page patterns (BackHeader, mobile-first 430px, shadcn/ui components)
- i18n support for all 3 languages (en/th/mm)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Transaction history page with date range filter at src/app/(main)/home/history/
- Profile settings page at src/app/(main)/profile/
- BackHeader component for sub-pages
- Demo mode bypass pattern for API routes
- react-day-picker for date selection

### Established Patterns
- API routes at src/app/api/ with Zod validation
- SWR hooks for data fetching
- Zustand stores for UI state
- shadcn/ui components (Button, Card, Select, etc.)

### Integration Points
- Transaction history page — add download button
- Profile page — add spending limits menu entry
- New route: /profile/spending-limits

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond ROADMAP success criteria.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
