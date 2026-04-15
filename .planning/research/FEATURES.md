# Feature Landscape: 2C2P Wave v1.1 — New Features

**Domain:** Mobile banking / cross-border remittance — Thailand (THB) to Myanmar (MMK)
**Researched:** 2026-04-15
**Confidence:** HIGH (features are well-understood; implementation details vary)
**Scope:** 15 new features targeting feature completeness gap between Pencil design and v1.0 shipped code

---

## Context

v1.0 shipped with all core banking flows: auth, KYC, wallet, add-money, transfer, withdrawal, history, virtual card display, profile, and QR. v1.1 closes the remaining Pencil/PRD gaps. All 15 features below are scoped here.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that feel incomplete or broken without them. Users won't call them out positively, but will notice their absence.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| T&C / Privacy consent during registration | PDPA compliance (Thailand PDPA B.E.2562) requires explicit consent before data collection; BOT financial service regulations mandate it; enforcement now active (THB 21.5M fines issued Aug 2025) | LOW | Must be clearly separate from the general T&C checkbox pattern; consent must be granular (data collection, marketing, cross-border transfer), explicit, and logged; pre-ticked boxes are non-compliant |
| Selfie / liveness capture with face guide overlay | eKYC step already exists in the app — liveness UI screen must match (circular frame, progress ring, instruction text); users expect the same face capture UX they see in banking apps they've used | MEDIUM | Circular overlay guide is industry standard; `playsInline` on `<video>` required for iOS; keep entire capture sequence on a single page/route to avoid iOS PWA re-prompting for camera permissions on route change |
| Bank account management (add / delete saved accounts) | Users need to manage withdrawal destinations; saving accounts is standard in every withdrawal-capable banking app | MEDIUM | Add: BSB/account number + alias + bank name selector; Delete: swipe-to-delete with confirmation sheet; list view matches saved recipient pattern already built |
| Pre-registration info + daily limit acknowledgment | Regulatory requirement — users must be informed of limits before they commit to onboarding; prevents abandonment and disputes when limits are hit later | LOW | Static info screen(s) before multi-step registration; daily limit acknowledgment is a single checkbox confirm — not a blocker, but required for audit trail |
| Notification inbox with unread badge | Every banking app has this; users expect a bell icon with count; post-transfer confirmation, KYC status updates, and promo messages must be surfaced somewhere in-app since real push notifications are out of scope | MEDIUM | In-app inbox only (no real push); unread count drives bottom nav badge; PWA Badging API can extend to homescreen icon on iOS 16.4+ and Chrome desktop; read/unread state stored in Supabase per user |
| E-receipt share / download as image | Users share receipts with family to confirm money is coming; screenshotting is unreliable (some banking apps block it); providing a share button is now expected | MEDIUM | Use `html2canvas` or `html-to-image` to render the receipt DOM node as PNG; Web Share API on mobile allows native share sheet (WhatsApp, Messenger, etc.); PNG is preferred over PDF for this persona (no PDF reader assumed) |
| Recipient favourites toggle + filter | Standard UX when recipient lists grow; migrant workers have 1-3 primary recipients and should find them instantly | LOW | Star/heart icon toggle on recipient card; filter chip on recipient list screen; state stored in recipient record in Supabase |

### Differentiators (Competitive Advantage)

Features that create retention and referrals. Not universally expected, but valued by target persona.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| P2P wallet-to-wallet transfer (wallet ID + QR) | Direct wallet-to-wallet is faster and cheaper than A/C transfer; WavePay/Wave Money already do this for Myanmar-to-Myanmar; adding THB-based P2P positions the app as a full wallet, not just a remittance tool | MEDIUM | Separate from A/C transfer — different flow (no bank routing, instant, lower/no fee); recipient entry via wallet ID text or QR scan; QR code embeds wallet ID; confirmation flow is simpler (no channel selection); use existing QR scanner |
| Cash pick-up transfer channel with secret code generation | Essential for recipients without bank accounts or Wave wallets; ~40% of Myanmar rural population is unbanked; secret code (alphanumeric, ~8 chars) is how cash agents authenticate payout | MEDIUM | Generate secret code server-side after transfer confirmation; display prominently on receipt; share via same E-receipt share flow; instruct user to share code + amount with recipient; code should expire (24-72h is industry norm); agent network is 2C2P's, so mock service handles validation |
| Referral stats + social share (WhatsApp, Line, copy link) | Referral programs drive acquisition in migrant worker communities; WhatsApp group chats are the primary social network; Line is dominant in Thailand; cost of acquisition via referral is lower than paid media | MEDIUM | Referral stats: count of invited friends, count converted, earned rewards (amount), tier progress; social share: use Web Share API for native sheet — includes WhatsApp and Line automatically on Thai/Myanmar phones; fallback: explicit WhatsApp deep link (`https://wa.me/?text=...`) and copy-to-clipboard; share card is a pre-composed message with referral link |
| Visa card request + payment flow | Elevates the app from remittance tool to digital wallet; physical Visa card signals permanence and trustworthiness; increases ARPU by adding FX card spend as a revenue stream | HIGH | Flow: address collection (Thai address) → card type/tier selection → FX fee display → confirm + pay issuance fee → processing state → success/fail; all mock — no real Visa integration; Thai address form needs province/district/subdistrict cascade (similar complexity to Myanmar address cascade); success state shows estimated delivery date |
| Biometric login (Face ID / Touch ID / Fingerprint) | Reduces passcode friction for repeat daily users; WebAuthn is now well-supported in PWAs installed to homescreen; differentiates from apps that stop at PIN | HIGH | Use WebAuthn (navigator.credentials) — no biometric data leaves device; only public key stored server-side (Supabase custom table); prerequisite: PWA must be installed to homescreen (camera/biometric access gated by iOS on homescreen-installed PWAs); Android Chrome and Safari iOS 16.4+ support this; must gracefully fall back to passcode when unsupported; enrollment is opt-in post-login |
| Myanmar address cascade (State → Township → Ward/Village) | Myanmar recipients often live in specific wards/villages that must be recorded for regulatory purposes; free-form text is unreliable for compliance and matching against MIMU Pcodes | MEDIUM | MIMU Pcodes dataset: ~17 States/Regions → ~330 Districts → ~400 Townships → ~14,000+ Wards/Villages; source from GitHub: MyanmarPost/MyanmarPostalCode or MIMU GeoNode; ship as static JSON (no runtime geo API needed); cascade: State select → Township select (filtered) → Ward/Village text input or select; bundle size concern: full dataset is ~500KB uncompressed, lazy-load or tree-shake to ward level only where needed |
| 123 Service convenience store top-up (barcode + ref codes) | 123 Service is a Thai convenience store payment network (counter service at Family Mart, Lawson 108, etc.); migrant workers may prefer counter cash payment over bank QR, especially if they don't have a Thai bank account | MEDIUM | Show barcode (Code 128, scannable at counter) + ref1 (company code) + ref2 (user's account number) + amount; barcode generation: `react-barcode` or `jsbarcode` (both well-maintained); instruction text in all 3 languages; 123 Service ref code format is defined by 2C2P — mock service provides these values |
| Work permit / 2nd document update flow | KYC documents expire (work permits are annual); users need to re-upload without going through full re-registration; supports continued compliance for long-term users | MEDIUM | Surfaces as a "Documents" section in Profile; shows current document status + expiry; upload flow reuses existing document capture component (camera overlay + file upload fallback); triggers mock KYC re-review; separate from primary NRC/passport; work permit is the most common 2nd document for this persona |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real push notifications for notification inbox | Users want timely alerts | Service Worker push requires VAPID keys, server-side push sender, subscription management per device — significant ops complexity; iOS Safari push has restricted permission UX that creates abandonment | In-app notification inbox with polling or Supabase Realtime for live updates; badge on bell icon; users check the inbox on app open |
| PDF receipt download | Feels "official" | Requires server-side PDF generation (Puppeteer/wkhtmltopdf) or heavy client library; PNG shared via Web Share API achieves the same user goal (proof of transfer for family) on low-end devices | PNG via html-to-image + Web Share API; 0 server cost, works offline |
| Full Myanmar address autocomplete / geolocation | Seems like better UX | Myanmar geocoding APIs are unreliable or expensive; MIMU Pcode dataset has naming inconsistencies (Burmese vs Latin romanization); live API adds latency on 3G | Static JSON cascade (State/Township/Ward) bundled at build time; good enough for regulatory compliance without complexity |
| Biometric login via camera (custom face recognition) | Feels cutting-edge | Web-based ML face recognition (face-api.js etc.) is heavy (~5-10MB models), requires camera permission on login, and has unacceptable false-positive rates; WebAuthn uses device secure enclave instead | WebAuthn platform authenticator — biometric never processed by the web app; device handles it entirely |
| WhatsApp / Line deep integration (OAuth, contacts) | Feels convenient | WhatsApp doesn't offer public OAuth; Line OAuth works but requires app registration and adds auth complexity; contacts access is browser-blocked for privacy | Web Share API covers the share use case without needing contacts access or OAuth; referral link is the unit of sharing, not a contact import |
| Cash pickup secret code via SMS | Users expect SMS-based code delivery | Out of scope — real SMS delivery requires Twilio/gateway; adds cost and ops overhead | Display code prominently in-app receipt; share via E-receipt Web Share flow (WhatsApp/Messenger to recipient) |
| Animated liveness challenge (blink/turn head) | Seems more secure | Active liveness (blink, head-turn) requires server-side video analysis or ML SDK — significant integration complexity; passive liveness (single photo quality check) is sufficient for mock service | Single selfie capture with face overlay guide; mock service simulates pass/fail deterministically via env var; note in mock service README that production would integrate active liveness vendor (FaceTec, Onfido, etc.) |

---

## Feature Dependencies

```
Existing v1.0 Foundation
  ├── T&C / Privacy consent
  │     └── requires: Registration flow (insert before step 1)
  │
  ├── Pre-registration info + daily limit acknowledgment
  │     └── requires: Registration entry point (insert before T&C)
  │
  ├── Selfie / liveness capture with face guide
  │     └── requires: eKYC document scan step (already built)
  │           └── enables: Work permit / 2nd document update (reuses same camera component)
  │
  ├── Bank account management
  │     └── requires: Profile screen (already built)
  │           └── enhances: Withdrawal flow (populated bank account list)
  │
  ├── P2P wallet-to-wallet transfer
  │     └── requires: QR scanner (already built), Wallet ID (already stored)
  │           └── depends-on: existing transfer confirmation + receipt patterns
  │
  ├── Cash pick-up transfer channel
  │     └── requires: Transfer channel selection (already built)
  │           └── requires: E-receipt share (secret code must be shareable)
  │
  ├── E-receipt share / download
  │     └── requires: Receipt screen (already built)
  │           └── enables: Cash pickup secret code sharing
  │
  ├── 123 Service top-up
  │     └── requires: Add money channel selection (already built)
  │
  ├── Visa card request + payment flow
  │     └── requires: Virtual card display (already built), KYC approved
  │           └── requires: Myanmar/Thai address cascade (if Thai address collection is needed)
  │
  ├── Myanmar address cascade
  │     └── requires: Any address form (registration, Visa card request, recipient add)
  │           └── enables: Work permit update form (address re-confirmation)
  │
  ├── Notification inbox + unread badge
  │     └── requires: Supabase notifications table (new schema required)
  │           └── enhances: KYC status updates, transfer receipts, promo messages
  │
  ├── Recipient favourites toggle + filter
  │     └── requires: Recipient management (already built)
  │
  ├── Referral stats + social share
  │     └── requires: Refer friends page (already built — adds stats + share)
  │
  └── Biometric login
        └── requires: Auth system (already built)
              └── requires: PWA installed to homescreen (WebAuthn gated)
              └── depends-on: Passcode login (fallback)
```

### Dependency Notes

- **T&C + Pre-registration screens require insertion into existing registration flow:** These are new steps prepended to the existing multi-step registration; the step counter and back-navigation must be updated. LOW technical risk but requires care with step numbering.
- **Cash pickup requires E-receipt share:** The secret code is useless if users can't easily share it with their recipient; build E-receipt share first or in the same phase.
- **Biometric login requires WebAuthn platform support check at runtime:** The enrollment UI must only appear when `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` returns true. Never show the option on unsupported devices.
- **Myanmar address cascade is a standalone data concern:** It can be built as an independent component and dropped into any form that needs it (registration, Visa card request, recipient add). Build it once, reuse.
- **Notification inbox requires a new Supabase table:** `notifications(id, user_id, type, title, body, read, created_at)` — this is greenfield schema work. The inbox UI depends on this.

---

## Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| T&C / Privacy consent | HIGH (legal compliance) | LOW | P1 |
| Pre-registration info + limit acknowledgment | HIGH (legal compliance) | LOW | P1 |
| Selfie / liveness capture | HIGH (KYC completeness) | MEDIUM | P1 |
| Bank account management | HIGH (withdrawal UX) | MEDIUM | P1 |
| E-receipt share / download | HIGH (core transfer UX) | MEDIUM | P1 |
| Cash pick-up channel with secret code | HIGH (unbanked recipients) | MEDIUM | P1 |
| P2P wallet-to-wallet transfer | HIGH (wallet utility) | MEDIUM | P1 |
| Recipient favourites | MEDIUM (UX polish) | LOW | P1 |
| 123 Service top-up channel | MEDIUM (funding access) | MEDIUM | P1 |
| Notification inbox + unread badge | MEDIUM (engagement) | MEDIUM | P2 |
| Myanmar address cascade | MEDIUM (compliance) | MEDIUM | P2 |
| Work permit / 2nd document update | MEDIUM (long-term users) | MEDIUM | P2 |
| Referral stats + social share | MEDIUM (acquisition) | MEDIUM | P2 |
| Visa card request + payment flow | MEDIUM (wallet stickiness) | HIGH | P2 |
| Biometric login | LOW-MEDIUM (PWA limitations) | HIGH | P3 |

**Priority key:**
- P1: Ship in early v1.1 phases — closes critical UX and compliance gaps
- P2: Ship in mid v1.1 phases — adds value but no blockers if delayed
- P3: Ship last — significant complexity for incremental value given PWA constraints

---

## Implementation Notes by Feature

### T&C / Privacy Consent
Insert as screen(s) before step 1 of the existing multi-step registration. Two consents needed: (1) Terms of Service / T&C scroll + accept, (2) Privacy policy + granular marketing consent toggle. Store acceptance timestamp and version in user profile. Under Thailand PDPA, consent must be re-obtained if T&C changes materially.

### Pre-Registration Info + Daily Limit Acknowledgment
Static information screen shown before registration begins (even before T&C). Covers: who the service is for, ID types accepted, daily/monthly limits, fees summary. Final screen has a checkbox: "I understand the daily limit of 50,000 THB." This creates an audit trail and reduces later disputes. Can be skipped on return visits.

### Selfie / Liveness Capture
v1.0 has KYC document scan with camera. The face capture screen needs: circular guide overlay (CSS clip-path or SVG circle cutout), progress ring animation during capture, instruction text in 3 languages, single-page capture sequence (no route changes during camera session due to iOS re-prompt issue). Mock service decides pass/fail via `MOCK_KYC_RESULT` env var.

### Bank Account Management
New sub-page under Profile > Saved Bank Accounts (or Withdrawal Settings). Add: form with fields (account name, account number, bank name from dropdown, account type). Delete: slide or long-press to delete with confirmation bottom sheet. List: each bank account card shows bank logo, account number (last 4 digits), and account name. This populates the recipient selection in the Withdrawal flow.

### P2P Wallet-to-Wallet Transfer
Distinct from the A/C (bank account) transfer flow. Entry point: "Send to Wallet" button on Quick Actions grid, separate from "Transfer" (A/C). Flow: (1) Enter wallet ID or scan QR → (2) Amount in THB → (3) No channel selection (always instant to Wave wallet) → (4) Fee display (low/zero fee for wallet-to-wallet) → (5) Passcode confirmation → (6) Receipt. The recipient's wallet ID is the 2C2P Wave user ID or a shorter alphanumeric wallet address.

### Cash Pick-Up Transfer Channel
In the existing transfer channel selection screen, add "Cash Pick-Up" as a new option with its own fee tier and delivery description ("Recipient collects cash at any 2C2P Wave agent"). Post-confirmation, the receipt screen adds a prominent "Secret Code" section (large mono font, tap-to-copy). This code is what the recipient shows at the agent for cash out. Mock service generates it; display alongside the E-receipt share button.

### 123 Service Top-Up
New channel option in the Add Money / Top-Up flow alongside the existing bank QR option. Displays a Code 128 barcode (use `JsBarcode` or `react-barcode`) for scanning at the counter. Shows: Ref 1 (company code), Ref 2 (user account number), Amount (user-entered). Instructions in TH/EN/MM. No expiry displayed (user must complete payment within the session at the counter).

### Visa Card Request + Payment Flow
Triggered from the Virtual Card display screen ("Request Physical Card" button, currently absent). Flow: (1) Confirm shipping address (Thai address form using address cascade) → (2) Select card tier if applicable → (3) Show issuance fee (mock: 299 THB) + FX rates for card spend → (4) Passcode confirm → (5) Processing animation → (6) Success (estimated delivery 7-14 days) or Fail (insufficient balance, try again). Full mock; no real Visa API.

### Work Permit / 2nd Document Update
Profile > Documents section. Shows: NRC/passport (primary document) with status + expiry, Work Permit (secondary) with status + expiry + "Update" CTA. Tapping Update opens the same document capture component used in KYC. Submits to mock KYC service. Shows "Under Review" state until mock service resolves.

### Myanmar Address Cascade
Standalone `MyanmarAddressSelect` component. Data source: static JSON from MyanmarPost/MyanmarPostalCode GitHub repo (State/Region → Township → Ward/Village). Three cascading selects: State (14 options) → Township (filtered by state, ~30-50 per state) → Ward/Village (text input or filtered select). Bundle the JSON lazily loaded (not in main bundle). Used in: recipient add form (for remittance compliance), Visa card request (if Myanmar address), work permit update (address confirmation).

### E-Receipt Share / Download
Add a share button to the existing receipt screen. Implementation: use `html-to-image` (lighter than html2canvas, 2025 recommended) to render the receipt card DOM node as a PNG blob. Then call `navigator.share({ files: [pngBlob] })` (Web Share API level 2). Fallback for non-supporting browsers: trigger PNG download via `<a href="..." download>`. The receipt PNG should be styled for sharing: include the Wave logo, transaction details, and a "Keep this as proof" footer note. Do NOT include sensitive account numbers in the shared image.

### Recipient Favourites Toggle + Filter
Add a star icon to each recipient card in the recipient list. Tapping toggles a `is_favourite` boolean on the recipient record (Supabase). Add a filter pill at the top of the recipient list: "All | Favourites". Favourited recipients should sort to the top of the default list. This is a ~2-3 hour implementation on top of the existing recipient management code.

### Referral Stats + Social Share
The existing Refer Friends page has a QR code. Add: (1) Stats panel — "Friends invited: X | Friends joined: X | Rewards earned: X THB", (2) Social share buttons: WhatsApp (`https://wa.me/?text=[encoded_message_with_referral_link]`), Line (`https://line.me/R/msg/text/?[encoded]`), Copy Link (Clipboard API). The Web Share API can also be offered as a single "Share" button that opens the native share sheet on mobile (includes all installed apps).

### Biometric Login (Face ID / Touch ID / Fingerprint)
Use the WebAuthn API (`navigator.credentials.create()` for registration, `navigator.credentials.get()` for authentication). Prerequisites: (1) check `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` at login screen render — only show the biometric option if it returns `true`; (2) PWA must be installed to homescreen on iOS for Face ID to work; (3) store the credential ID and public key in Supabase (new table: `webauthn_credentials`). Enrollment flow: post-login passcode success → prompt "Enable Face ID?" → WebAuthn registration → store public key. Login flow: show biometric prompt → WebAuthn assertion → verify server-side → create Supabase session. Fallback to passcode always available.

### Notification Inbox + Unread Badge
New Supabase table: `notifications(id, user_id, type enum, title_en/th/mm, body_en/th/mm, read boolean, metadata jsonb, created_at)`. New screen: Notifications (accessible from bell icon in top header). Shows list of notifications sorted by `created_at DESC`. Mark-as-read on item tap and "Mark all read" CTA. Unread count drives badge on bell icon. For real-time badge updates: Supabase Realtime subscription on `notifications` table filtered by `user_id` and `read = false`. Types: `transfer_complete`, `kyc_status_update`, `promo`, `system_alert`.

---

## Sources

- Thailand PDPA enforcement 2025: https://cookieinformation.com/what-is-the-thailand-pdpa/
- WebAuthn / Biometric PWA support: https://progressier.com/pwa-capabilities/biometric-authentication-with-passkeys
- WebAuthn PWA biometric details: https://intercom.help/progressier/en/articles/8388990-can-a-pwa-use-biometric-authentication
- MIMU Myanmar Pcode dataset: https://themimu.info/place-codes
- Myanmar postal code dataset (GitHub): https://github.com/MyanmarPost/MyanmarPostalCode
- html-to-image vs html2canvas 2025: https://npm-compare.com/dom-to-image,html-to-image,html2canvas
- Web Share API image sharing: https://benkaiser.dev/sharing-images-using-the-web-share-api/
- PWA Badging API (MDN): https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Display_badge_on_app_icon
- Remittance app referral via WhatsApp: https://www.branch.io/resources/blog/referral-program-on-whatsapp/
- iOS PWA camera permission re-prompt issue: https://dev.to/niscontractor/qr-code-integration-in-pwa-and-its-challenges-18o4
- P2P payment app UX patterns 2025: https://medium.com/@Shakuro/how-to-build-a-p2p-payment-app-in-2025-42d22aa06d97
- Remittance app UX features: https://www.remitso.com/blogs/how-to-build-a-p2p-money-transfer-app-in-2025

---

*Feature research for: 2C2P Wave v1.1 — 15 new features*
*Researched: 2026-04-15*
