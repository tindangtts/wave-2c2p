# Feature Landscape: Mobile Banking & Cross-Border Remittance PWA

**Domain:** Mobile banking / cross-border remittance — Thailand (THB) to Myanmar (MMK) corridor
**Researched:** 2026-04-14
**Primary persona:** Myanmar migrant worker in Thailand (ages 20-45, basic smartphone, limited connectivity)
**Competitors studied:** Wave Money / WavePay, 2C2P Wave, TrueMoney Wallet for Foreigners, KBank, PromptPay

---

## Table Stakes

Features users expect as a baseline. Missing any of these and the product feels broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Phone + OTP login | No email literacy assumed; phone is primary identity for migrant workers | Low | Country code selector (+66/+95) essential; 6-digit OTP standard |
| 6-digit passcode for re-auth | Every competitor uses PIN, not password | Low | Biometric optional upgrade, not table stakes |
| eKYC: document scan (NRC/work permit) | Regulatory requirement; Thai BOT requires identity verification before remittance | High | Myanmar NRC is OCR-hard (handwritten older versions, non-standard layout); document type selection matters (NRC, Pink Card, OWIC, Visa, Passport) |
| eKYC: face liveness detection | BOT requirement; biometric verification unlocks higher transfer limits | High | Circular frame UX is industry standard; mock service must simulate pass/fail reliably |
| KYC status states (pending/approved/rejected/expired) | Users need to know what they can/cannot do; regulatory flows mandate rejection reasons | Medium | Re-submission flow critical — rejected users must have clear path back |
| Wallet balance display with show/hide toggle | Standard privacy feature; users often use app in public transit | Low | Balance as primary dashboard element; eye icon toggle pattern universal |
| THB → MMK conversion with live rate display | Core purpose of the app; rate must be shown before and locked at confirmation | Medium | Rate must display prominently; "rate at time of transaction" needed for receipt |
| Fee breakdown before confirmation | 80% of users cite hidden fees as top frustration; BOT transparency regulations apply | Medium | Per-channel fee display (Wave Agent vs App vs Bank Transfer vs Cash Pickup differ) |
| Receiving channel selection | Wave Agent / Wave App / Yoma Bank / Cash Pickup have different settlement times and fees | Medium | No-fee receiving at Wave Agent, Wave App, and Yoma Bank is competitor baseline |
| Recipient management (save/edit/delete) | Migrant workers send to same recipient repeatedly; re-entering details every time causes abandonment | Medium | Requires: name, phone, NRC, relationship, purpose — regulatory requirement for AML/EDD fields |
| Transfer confirmation + passcode | Security checkpoint before money moves; also regulatory requirement for audit trail | Low | Single page summary with all amounts, fees, exchange rate, recipient |
| Transaction receipt with reference number | Users need proof of transfer to share with recipients; pickup code required for cash agents | Low | Must be shareable (screenshot, share button) |
| Transaction history with status | Users need to verify sent money arrived; "pending" state is critical for cash pickup corridor | Low | Date filter + status filter (success/pending/rejected) |
| Add money (top-up) via bank/convenience store | Wallet must be fundable; migrant workers may not have Thai bank account | Medium | QR code generation for convenience store payment is critical (7-Eleven covers all of Thailand) |
| QR code scanning for payments/transfers | Industry standard; PromptPay QR is ubiquitous in Thailand | Low | Must support both static and dynamic QR |
| Language switching: EN / TH / Myanmar (Burmese) | Migrant workers are not Thai literate; Myanmar script rendering is non-trivial | Medium | TrueMoney added Burmese and grew significantly; must be runtime-switchable |
| Offline / degraded connectivity handling | Target users have spotty internet; losing a transfer mid-flow is catastrophic | Medium | Offline pages, retry queues, draft state for in-progress forms |
| System state screens (maintenance, update required) | Production requirement; users must never see raw error pages | Low | Maintenance screen with ETA is industry norm |
| Contact/support access | Migrant workers encounter friction; call center + Messenger/Viber is standard for this demographic | Low | Viber is dominant in Myanmar; Messenger dominant in Thailand |
| Transfer limits display | BOT regulatory requirement; 30 tx/month at 25,000 THB/tx is current 2C2P Wave limit | Low | Must show remaining limit; approaching-limit warning is good UX |

---

## Differentiators

Features that create competitive advantage. Users don't expect them but they drive retention and referrals.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Real-time balance after transfer | Reduces "did it work?" anxiety; most competitors require page refresh | Medium | Supabase Realtime enables this without polling |
| Per-channel delivery time estimate | "Wave Agent: instant / Bank Transfer: 1-2 business days" — sets expectations, reduces support tickets | Low | Static data, but high trust value |
| Transfer purpose pre-fill from recipient profile | Regulatory fields (purpose, relationship) required for AML; pre-filling from saved recipient reduces friction | Low | Saved recipients should carry purpose/relationship; reduces re-entry for repeat senders |
| Rate validity timer ("Rate valid for 5 min") | Gives user urgency signal without manipulation; manages backend rate exposure | Low | Must lock rate at confirmation, not at initiation |
| Monthly referral tracking with progress | Referral programs drive acquisition; monthly count with reward threshold visual motivates completion | Medium | Monthly reset pattern with reward tiers is effective for this user segment |
| Promotions carousel personalized by KYC status | Pre-KYC users see onboarding promos; approved users see transfer offers | Medium | Reduces irrelevant noise; increases promo conversion |
| Transfer draft / resume | If connectivity drops mid-flow, user can resume without re-entering data | Medium | Session state in localStorage with TTL; reduces abandonment on 3G |
| In-app FAQ for each rejection reason | KYC rejection is high-friction; immediate in-app guidance reduces support load | Low | Each rejection code maps to specific help content |
| Virtual Visa card for online payments | Expands utility beyond remittance; makes the wallet stickier for daily spend | High | Card display with details reveal, freeze, balance — significant regulatory overhead for real issuance; mock for MVP |
| Bills payment placeholder | Signals future utility to users; keeps them checking the app even between remittances | Low | Placeholder with "coming soon" keeps feature in mental model without full build |

---

## Anti-Features

Things to explicitly NOT build, and why.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real exchange rate integration (live API) | Out of scope for MVP; API keys, rate agreements, and hedging logic are operational complexity | Mock rate engine via env var; configurable fixed rate with optional daily update |
| Real SMS/OTP delivery | Adds Twilio/SMS gateway cost and ops complexity for MVP/demo build | Auto-bypass OTP in development; mock OTP flow with configurable code |
| Real eKYC vendor integration (Jumio, Onfido, etc.) | Vendor contracts, webhook complexity, production keys — not needed to demonstrate UX | Mock service with configurable pass/fail via env var; simulated review delay |
| Real push notifications | Service Worker push requires VAPID keys, push subscription management, server-side sender | Placeholder notification icon with badge; notification preferences UI only |
| Admin dashboard | Separate product with different personas; adds scope without user value for MVP | Leave all admin functions out; focus exclusively on user-facing flows |
| Crypto/DeFi features | No regulatory pathway for Myanmar corridor; FATF-listed status of Myanmar increases compliance exposure | Not applicable to this use case |
| Social feed / activity sharing | Privacy concern for migrant workers; transfers are private matters | Receipts shareable by user choice only; no automatic social broadcasting |
| Complex spending analytics | Adds complexity; not relevant for migrant worker persona making 1-4 transfers per month | Transaction history with basic filters is sufficient |
| Dynamic exchange rate negotiation | Rate shopping or "best rate guarantee" logic requires real broker integrations | Show single rate clearly with fee breakdown; transparency beats complexity |
| Free-form support chat (live agent) | Real-time chat needs staffed agents and chat infrastructure | Static contact page with Viber/Messenger deep links; users route to human channel |
| Account-to-account lending / credit | Regulated product requiring separate license from BOT | Not in scope; would require full banking license pathway |
| Biometric login (fingerprint/face unlock) | PWA biometric auth via WebAuthn is browser-inconsistent on Android; adds auth complexity | Passcode is the baseline; biometric is future enhancement with explicit browser support check |
| Multi-recipient batch transfer | Complex UX; not a migrant worker use case (they send to 1-2 people) | Single recipient per transfer; recipient favorites handle repeat use |
| QR code scanning for identity verification | Unreliable in low-light/crumpled document scenarios; OCR quality varies | Camera overlay guide for document capture; manual fallback for entry |

---

## Feature Dependencies

```
Phone+OTP Login
  └── Registration (personal info)
        └── eKYC document scan
              └── eKYC face liveness
                    └── KYC status (pending → approved)
                          └── Transfer flow (gated on KYC approved)
                                ├── Recipient management (must exist before transfer)
                                ├── Wallet balance (must be funded)
                                │     └── Add money / Top-up flow
                                ├── Channel selection
                                ├── Fee display
                                └── Transfer confirmation + receipt
                                      └── Transaction history

Passcode setup → Passcode re-auth on transfer confirmation
Language selection → All screens (runtime switch, no reload)
QR scanner → Add money (QR generation) + Transfer initiation
Referral tracking → Post-KYC only (no unverified referrals)
Virtual Visa card → Post-KYC only
```

---

## Regulatory Feature Requirements

These are features driven by compliance, not UX preference. They are non-negotiable.

| Requirement | Source | Implementation |
|-------------|--------|----------------|
| KYC before any transfer | Thai BOT + AML Act B.E.2542 | Gate transfer flow on KYC approved status |
| Enhanced due diligence for Myanmar corridor | FATF (Myanmar on high-risk call-for-action list through 2025+) | Recipient NRC, occupation, purpose of transfer are mandatory fields |
| Transfer limit display (30x/month, 25,000 THB/tx) | Current 2C2P Wave product limits | Show remaining monthly count on transfer initiation |
| Biometric verification to unlock higher limits | Thai BOT 2025 update | Face verification during KYC unlocks standard limits; lower limits for non-biometric verified users |
| ITRS code on Myanmar transfers | Central Bank of Myanmar (effective June 2020) | Backend concern for real payment processing; mock service should accept field |
| Transaction reference number on receipt | Standard banking audit requirement | Every transaction must have immutable reference on receipt |
| Rate at time of transaction on receipt | Consumer protection / transparency | Receipt must show exchange rate used, not current rate |
| Rejection reasons on KYC rejection | User rights / regulatory flow | Cannot just say "rejected"; must provide specific reason codes |

---

## Transfer Limits Reference (2C2P Wave Current)

| Limit Type | Value | Notes |
|------------|-------|-------|
| Per transaction | 25,000 THB | Current product limit |
| Per month (count) | 30 transactions | Monthly cap |
| No-fee receiving | Wave Agent, Wave App, Yoma Bank | Competitive baseline — fees charged to sender only |
| Daily transfer cap (BOT 2025) | 50,000 THB | Applies to vulnerable users (new accounts, elderly, children); experienced users may have different limits |

---

## Competitor Feature Comparison

| Feature | 2C2P Wave | TrueMoney for Foreigners | WavePay (Myanmar) |
|---------|-----------|--------------------------|-------------------|
| Burmese language support | Yes | Yes (key launch feature) | Yes |
| Instant transfer to Wave Wallet | Yes | — | Yes |
| Cash pickup at agent network | Yes (61,000+ agents) | — | Yes (59,000+ agents) |
| Yoma Bank account deposit | Yes | — | — |
| Fee-free transfers | Yes (sender pays, receiver free) | Yes (TrueMoney to TrueMoney) | Varies |
| Monthly limits | 30x / 25,000 THB | Not specified publicly | — |
| KYC requirement | Yes (biometric) | Yes | Yes |
| QR payment | Yes | Yes | Yes (200,000+ merchants) |
| Bill payment | — | — | Yes (30+ providers) |
| Virtual card | Planned | — | — |
| Referral program | Yes | — | — |

---

## MVP Recommendation

### Must Build (Phase 1-2)

1. Authentication: phone + OTP + passcode setup
2. Registration + eKYC (mock service with configurable pass/fail)
3. KYC status management (all states including expired/rejected)
4. Home dashboard with wallet balance + quick actions
5. Add money (top-up) via bank + QR code generation
6. Recipient management (full CRUD with all regulatory fields)
7. Transfer flow: recipient → amount + conversion → channel → fee display → confirmation → receipt
8. Transaction history with filters
9. Language switching (EN/TH/MM) — must be early, not an afterthought
10. System state screens (maintenance, force update, network error)

### Build in Parallel (Design System Foundation)

- shadcn/ui component library with Wave brand tokens
- i18n scaffold with next-intl (all 3 languages)
- Mock service architecture (eKYC + payment configurable via env)

### Defer (Phase 3+)

- Virtual Visa card (UI only; no real issuance)
- Withdrawal flow (simpler than transfer, can follow same pattern)
- Referral program (needs transfer volume to be meaningful)
- Bills payment (placeholder only for MVP)
- Biometric login (WebAuthn PWA support inconsistent)

### Do Not Build

Everything in the Anti-Features table above.

---

## Sources

- Wave Money 2C2P Wave app features: https://wavemoney.com.mm/2c2p-wave-app
- 2C2P Wave launch announcement: https://www.thestorythailand.com/en/16/10/2025/164872/
- TrueMoney Wallet for Foreigners (Burmese language): https://www.ascendmoneygroup.com/trueMoney-wallet-for-foreigners/
- TrueMoney transfer limits: https://support.truemoney.com/en/knowledge-base/credit_limit/
- FATF Myanmar high-risk status (October 2025): https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions/Call-for-action-october-2025.html
- Thailand AML/KYC regulations 2025: https://www.tookitaki.com/blog/thailand-aml-cft-regulations-2025
- Thailand 50,000 THB daily transfer cap (BOT 2025): https://www.nationthailand.com/business/banking-finance/40054226
- Essential remittance platform features 2025: https://payoro.com/remittance-platform/
- Fee transparency and exchange rate UX: https://worldbusinessoutlook.com/mobile-apps-exchange-rates-and-transparency-what-todays-remittance-users-expect/
- Myanmar NRC verification challenges: https://shuftipro.com/identity-verification-merchants-guide-book-myanmar/
- WavePay features and agent network: https://www.wavemoney.com.mm/wave-app/
- Thailand-Myanmar remittance ITRS code requirement: https://remittanceprices.worldbank.org/corridor/Thailand/Myanmar
- Dark patterns in fintech to avoid: https://www.theuxda.com/blog/dark-patterns-in-digital-banking-compromise-financial-brands
- Mobile banking for migrant workers: https://weblog.iom.int/mobile-banking-gateway-migrant-workers-health-and-security
