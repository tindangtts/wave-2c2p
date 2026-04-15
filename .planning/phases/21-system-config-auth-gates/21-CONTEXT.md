# Phase 21: System Config & Auth Gates - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode — discuss skipped)

<domain>
## Phase Boundary

Create system_config table for runtime flags (maintenance_mode, min_version, recommended_version). Add app-open checks that show blocking modals. Add permanently_rejected user gate at login. Implement single active session per user (new login invalidates prior). Five auth requirements (AUTH-01 through AUTH-05).

</domain>

<decisions>
## Implementation Decisions

### System Config Table (AUTH-01)
- system_config table: key (text PK), value (jsonb), updated_at
- Keys: maintenance_mode (boolean), min_version (string), recommended_version (string)
- Add to Drizzle schema + SQL migration
- Create /api/system/status endpoint reading from system_config

### Maintenance Mode (AUTH-02)
- Check /api/system/status on every app open (in proxy.ts or layout)
- If maintenance_mode = true → show blocking MaintenanceModal (non-dismissible except OK)
- Modal text from PRD: "System Under Maintenance. Currently system is under maintenance. We will be back soon..."

### Version Gate (AUTH-03)
- Compare app version (from package.json or env) against min_version and recommended_version
- Hard update (min_version mismatch): blocking modal, only Quit option
- Soft update (recommended_version mismatch): dismissible once per session
- Modal text from PRD: "Software Update. A software update is required."

### Rejected Number Gate (AUTH-04)
- Add permanently_rejected boolean column to user_profiles
- Pre-login: after phone entry, check if number is permanently_rejected
- If true → show rejection modal: "Registration is Rejected. Sorry, Your profile is rejected."
- Block cannot proceed to OTP

### Single Active Session (AUTH-05)
- On successful login, call Supabase admin API to sign out all other sessions
- Requires SUPABASE_SERVICE_ROLE_KEY env var
- First device gets redirected to login on next authenticated API call

### Claude's Discretion
- Modal component styling (use existing shadcn Dialog patterns)
- Where to place the system status check (proxy.ts vs client-side useEffect)
- Session invalidation timing (immediate vs next API call)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/components/ui/dialog.tsx — shadcn Dialog for modals
- src/proxy.ts — Next.js 16 proxy (middleware replacement)
- src/app/(auth)/login/page.tsx — Phone entry page (add rejection check)
- src/lib/supabase/server.ts — Server-side Supabase client (service role for admin API)

### Established Patterns
- Drizzle for all data queries, Supabase for auth only
- isDemoMode branches preserved (Phase 22 removes them)
- db.batch() for atomic writes
- Modal patterns: existing success/fail modals in transfer flows

### Integration Points
- System status check triggers before home screen loads
- Rejection gate triggers at phone entry before OTP send
- Session invalidation happens at OTP verify or passcode verify

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond PRD sections 4.1, 4.12, 4.13, 5.1 (AUTH-09 through AUTH-12).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
