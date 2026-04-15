# Phase 15: QR Scanner & WebAuthn Migration - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

The QR scanner page uses real camera hardware for live scanning, and the biometric auth system is backed by proper database columns in the deployed environment. Covers: @yudiel/react-qr-scanner integration replacing mock scan page, QR type detection (wallet ID vs payment code) with routing, file-input fallback for iOS PWA, and Supabase SQL migration for WebAuthn columns.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure/integration phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from PROJECT.md:
- @yudiel/react-qr-scanner chosen for live camera QR scanning
- File-input fallback needed for iOS PWA camera limitations
- WebAuthn columns: credential_id, public_key, counter, challenge on user_profiles
- Existing WebAuthn API routes from Phase 13 (v1.1) must work with new DB columns

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing scan page at src/app/(main)/scan/page.tsx (mock — to be replaced)
- WebAuthn API routes from Phase 13: api/auth/webauthn/register/, authenticate/
- @simplewebauthn/browser@13.3.0 + @simplewebauthn/server@13.3.0 already installed
- P2P transfer flow at /transfer/p2p (wallet ID entry target)

### Established Patterns
- Camera overlay component exists (src/components/features/camera-overlay.tsx)
- Demo mode bypass pattern across all API routes
- Supabase schema at .planning/supabase-schema.sql

### Integration Points
- Scan page → P2P transfer flow (wallet ID detected)
- Scan page → Add money flow (payment code detected)
- WebAuthn columns → existing biometric auth flow

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure/integration phase.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
