**2C2P WAVE**

Product Requirements Document

| **Field**        | **Value**                                                   |
| ---------------- | ----------------------------------------------------------- |
| Document Version | 1.0                                                         |
| Application      | 2C2P Wave - Mobile Wallet (iOS & Android)                   |
| Scope            | Full lifecycle: Onboarding → Transactions → Account Closure |
| Date             | April 2026                                                  |
| Status           | DRAFT                                                       |
| Classification   | CONFIDENTIAL                                                |

# **1\. Product Overview**

## **1.1 Application Purpose**

2C2P Wave is a regulated mobile e-wallet application operated by 2C2P Plus (Thailand) Co., Ltd. under Bank of Thailand e-money licensing. It enables Myanmar migrant workers residing in Thailand to register a compliant digital wallet, top up funds via Thai banking and convenience-store networks, transfer money domestically (THB) and internationally (MMK), withdraw to Thai bank accounts, pay via virtual Visa card, manage recipients, and view full transaction history with downloadable e-receipts.

This PRD covers the complete user lifecycle from first app open through account closure, incorporating all screens from both the original design package (Phase 1-2) and the supplemental Phase 3 designs.

## **1.2 Target Users**

| **Role**                             | **Description**                           | **Primary Needs**                                           |
| ------------------------------------ | ----------------------------------------- | ----------------------------------------------------------- |
| Guest                                | Phone entered; no account created         | View exchange rates; prompted to register                   |
| Registered - KYC Pending             | Account created; KYC under review         | Limited top-up; await approval                              |
| Registered - KYC Approved            | Fully verified user                       | Full wallet: top-up, transfer, withdraw, Visa card, history |
| Registered - KYC Expired             | Approved but document expired             | Must re-verify; limited features until updated              |
| Registered - KYC Rejected (Resubmit) | Rejected but eligible to retry            | Follow update instructions; resubmit documents              |
| Registered - Permanently Rejected    | Rejected; no further registration allowed | Account blocked; only contact support                       |
| Admin (Back Office)                  | 2C2P staff                                | KYC review, user management, limit configuration            |

## **1.3 Platform**

- iOS 14+ and Android 8+
- Languages: English, Thai, Myanmar (Unicode/Zawgyi switchable)
- Minimum device: 2 GB RAM; tested on low-end Android devices

# **2\. Objectives & Success Metrics**

| **KPI**                       | **Target**            | **Measurement**                           |
| ----------------------------- | --------------------- | ----------------------------------------- |
| KYC Approval Rate             | \> 85% within 24 hrs  | Admin queue approvals / total submissions |
| Top-up Success Rate           | \> 98%                | Webhook confirmations / QR generated      |
| Transfer Completion Rate      | \> 97%                | Completed / initiated                     |
| Withdrawal Success Rate       | \> 97%                | Completed / initiated                     |
| Visa Card Transaction Success | \> 95%                | Payment Success / total requests          |
| OTP Delivery Rate             | \> 99.5%              | SMS gateway delivery logs                 |
| App Crash-Free Rate           | \> 99.5%              | Firebase Crashlytics                      |
| Avg First-Transaction Time    | < 15 min from install | Funnel analytics                          |
| Monthly Active Users          | +15% MoM              | Analytics platform                        |
| Referral Conversion           | \> 20%                | Approved referrals / total shared links   |
| Maintenance Downtime          | < 0.1% monthly        | Uptime monitoring                         |
| Support Response Time         | < 4 hrs               | CRM ticket SLA                            |

# **3\. User Roles & Permissions Matrix**

| **Feature**                     | **Guest** | **KYC Pending** | **KYC Approved** | **KYC Expired** | **Perm. Rejected** | **Admin** |
| ------------------------------- | --------- | --------------- | ---------------- | --------------- | ------------------ | --------- |
| Register / OTP Login            | ✓         | ✓               | ✓                | ✓               | View only          | N/A       |
| Add Money - QR Top-up           | ✗         | ✓ (capped)      | ✓ (max 25K)      | Limited         | ✗                  | N/A       |
| Domestic Transfer (P2P / A/C)   | ✗         | ✗               | ✓                | ✗               | ✗                  | N/A       |
| International Transfer (MMK)    | ✗         | ✗               | ✓                | ✗               | ✗                  | N/A       |
| Withdraw to Bank                | ✗         | ✗               | ✓                | ✗               | ✗                  | N/A       |
| Visa Card Request & Payment     | ✗         | ✗               | ✓                | ✗               | ✗                  | N/A       |
| Scan QR to Receive / Pay        | ✗         | ✗               | ✓                | ✗               | ✗                  | N/A       |
| Transaction History + E-Receipt | ✗         | ✓               | ✓                | ✓               | ✗                  | ✓         |
| Manage Recipients               | ✗         | ✗               | ✓                | ✗               | ✗                  | N/A       |
| Referral Program                | ✗         | ✗               | ✓                | ✗               | ✗                  | View      |
| KYC Update / Re-submit          | ✗         | ✓               | On expiry        | ✓               | Update only        | N/A       |
| Change Phone Number             | ✗         | ✓               | ✓                | ✓               | ✗                  | N/A       |
| Contact Us                      | ✓         | ✓               | ✓                | ✓               | ✓                  | N/A       |
| Language Switch                 | ✓         | ✓               | ✓                | ✓               | ✓                  | N/A       |
| Approve / Reject KYC            | ✗         | ✗               | ✗                | ✗               | ✗                  | ✓         |
| Manage Limits                   | ✗         | ✗               | ✗                | ✗               | ✗                  | ✓         |
| Software Update Enforcement     | System    | System          | System           | System          | System             | Trigger   |
| Maintenance Mode Display        | System    | System          | System           | System          | System             | Trigger   |

# **4\. End-to-End User Flows**

## **4.1 Application Entry - First Open**

- App launched → splash screen → check API: maintenance mode flag + min version check.
- If maintenance mode ON → Modal: "System Under Maintenance. We will be back soon." → OK dismisses but all actions blocked.
- If current version < min_version → modal: "Software Update. A software update is required." → Quit (closes app) or Now (opens app store).
- If all checks pass → Welcome / Login screen with language selector (English default).

## **4.2 Registration & KYC**

### **4.2.1 New User Registration**

- User enters Thai mobile number (TH +66 format) → taps Login / Register.
- System checks number: if permanently rejected → inline text: "Your registration is rejected." + modal on tap: "Registration is Rejected. Sorry, Your profile is rejected. You are no longer permitted to register again."
- If rejected but resubmit eligible → inline text shown + modal: "Update Instructions. Follow the instructions to update with correct information." → Try Again → restart KYC flow.
- New number: OTP sent (6-digit, 60s expiry, max 3 resends) → user verifies OTP.
- New account created → proceed to Consent → T&C + Privacy Policy (mandatory accept).
- KYC Document selection: Thai National ID or Passport.

### **4.2.2 KYC - Thai National ID Path**

- Camera opens → capture front of Thai National ID card.
- System OCR: extracts name (Thai + English), ID number, DOB, address, expiry.
- User reviews pre-filled info → confirms.
- Selfie / liveness capture: face clearly visible, no glasses, no hat.
- Fill remaining fields: occupation, business type, workplace, wallet purpose, referral code, permanent + mailing address.
- Summary screen → confirm → submit.
- Status: KYC PENDING → push notification on admin action.

### **4.2.3 KYC - Passport + Work Permit Path (Myanmar Migrant)**

- Select document type: Passport → scan passport photo page (OCR).
- 2nd Document Verification screen: choose one of - Pink Card / Work Permit Document / Oversea Worker Identification Card (OWIC) / Visa.
- Camera opens → capture front of work permit → back of work permit (two shots).
- Selfie / liveness check against passport photo.
- Fill: occupation, business type, workplace (must be Work or School name; no Myanmar language for this field), wallet purpose, referral code.
- Address: permanent address (must include unit number + street name; Myanmar language allowed).
- Confirm OWC/document details screen → Confirm → submit.
- Status: KYC PENDING.

### **4.2.4 Rejection Handling**

**Rejected Reasons per Step**

Passport scan: image must be clear, original, name must match, passport not expired, selfie must match.

Work permit scan: document not expired, original, only Work Permit / Pink Card / OWC / long-term visa accepted.

Selfie: no glasses, no hat, must match passport/ID photo.

OWC confirmation: must select relevant Business Type; Type in Myanmar language allowed.

Additional Info: select most relevant Business Type; Workplace in Myanmar not allowed.

Address: must include unit number and street name; do not write in Myanmar language.

- Admin rejects KYC with reasons → user receives push notification.
- If permanently rejected: at next login, phone number flagged → modal shown → account permanently blocked.
- If resubmit eligible: "Update Instructions" modal shown → user taps Try Again → restarts KYC at step appropriate to rejection.

## **4.3 Login - Returning User**

- Enter registered mobile number → system validates.
- If number is permanently rejected → rejection modal shown immediately.
- OTP sent → verify → passcode screen (4-6 digit) or biometric if enabled.
- On successful auth → home screen loads.
- Post-login checks (in order): Maintenance mode? → Software update? → KYC expired? → display appropriate modal.

## **4.4 Home Dashboard**

- Top section (yellow): 2C2P Wave logo, language switcher (top-left), notification bell (top-right).
- User name + wallet balance (show/hide toggle).
- Wallet ID (18-digit; tap to copy).
- Quick-action icons: Contact Us, Referral, Withdrawal, History.
- Receiving channels section: live THB/MMK rates for Wave Agent, Wave App.
- Send Money button → sub-menu: Transfer within Thai / Transfer to Myanmar.
- Recent History (last 5 transactions with status).
- Promotions / Information banners (CMS-driven).
- Bottom nav: Home, Scan, \[Add Money central button\], Profile.

## **4.5 Add Money (Wallet Top-up)**

- Tap Add Money (bottom nav) → wallet balance + max top-up displayed.
- Enter amount (min 150 THB; max transaction = 25,000 THB − current balance).
- Top-up Channels section: Generate QR to top-up (bank apps) or 123 Service.
- Bank QR channels: SCB, KTB, BAY, BBL, KBANK, GSB.
- 123 Service channels: Big C, CenPay, Pay@Post, Robinson, Tesco Lotus.
- Tap Generate QR → backend calls 2C2P API → QR Code screen shows: QR image, barcode, Ref.1 (Payment Code), Ref.2 (mobile number), amount, pay-before timestamp.
- User opens bank app / visits store → completes payment.
- 2C2P webhook → wallet credited → push notification + history entry.

## **4.6 Transfer - Peer-to-Peer (P2P) Wallet Transfer**

- Home → Send Money → (or Scan tab) → Transfer screen.
- Your Wallet ID shown; Receiver Wallet ID field (manual entry or scan QR).
- Transfer Amount (THB) + optional Note.
- Tap Next → Confirmation screen: shows sender name/ID, receiver name/ID, amount, fees, note.
- Tap Confirm → Enter Passcode (6-digit) screen.
- Backend validates: sufficient balance, receiver wallet active, limits.
- Success → Transaction Detail / E-Receipt: Receiving Channel = P2P Transfer, from/to account names, amount, date, transaction ID. Share button available.

### **4.6.1 QR-based P2P (Receive Money with QR)**

- Sender taps Scan tab → camera opens → scan receiver's QR code.
- Receiver's name + wallet ID auto-populated.
- Send Amount modal appears → enter amount → Next.
- OR: Receiver taps their QR → "Receive Money with QR" button → shows their wallet QR with name for sender to scan.
- Flow continues same as manual P2P from confirmation step.

## **4.7 Transfer - A/C Transfer (Domestic Bank or Myanmar)**

- Send Money → select recipient from saved list or create new.
- Recipient types: Home Bank Account / Wave App / Wave Agent / Cash Pick-up at Bank / Cash Pick-up at Yoma Bank.
- For new recipient: fill Recipient Information form (see Section 5.5).
- Enter amount → review exchange rate (THB→MMK if international).
- Confirmation screen → Passcode → submit.
- E-Receipt: shows transfer type, from/to, exchange rate, transfer amount, fees, sent amount, receiving amount (MMK), transaction ID.
- Cash Pick-up channel: secret code generated (e.g. 047532) → displayed on receipt with copy button → "Money has been sent to XXX. Copy and send this secret code to your receiver."

## **4.8 Transaction History & E-Receipts**

- History tab (or Home quick action) → Transaction History screen.
- Filter: All / This week / Last month / Last year + custom date range via calendar picker.
- Each row: transaction type, date/time, amount (+ green / − red), status (Success / Pending / Rejected).
- Tap row → E-Receipt screen with 2C2P Wave branding.

### **E-Receipt content by transaction type:**

- Add Money: account name, mobile, amount, date/time, transaction ID, license number.
- P2P Transfer: from/to account + mobile, amount, date, transaction ID.
- A/C Transfer (international): from/to, exchange rate, transfer amount, fees, sent amount, receiving amount (MMK), date, transaction ID.
- Cash Pick-up: all above + secret code (with refresh/copy icon).
- Wallet Transfer: from/to, amount, date, transaction ID.
- Pending status: yellow clock icon + "Last checked" timestamp.
- Rejected status: red X icon.

- Share button on each receipt → native share sheet.

## **4.9 Withdrawal**

- Home → Withdrawal quick action → Withdraw screen.
- Displays: Account No (user's wallet ID), Available Balance.
- Enter Transfer Amount (THB).
- Select bank account to receive money: saved accounts listed or "Add more bank account."
- "Add Bank Account" flow: enter Bank Name (dropdown with Thai banks: SCB, Bangkok Bank, Krungsri Ayudhya, Kachorn Bank, Krungthai Bank, TMBThanachart Bank Public Company Limited, UOB Bank, GHB Bank, Government Savings Bank, United Overseas Bank, Bank for Architecture and Agricultural Cooperatives) + Bank Account No + Bank Account Name.
- Confirm bank details screen → optional note.
- Delete Bank Account option: confirmation dialog (Cancel / Confirm).
- Next → Confirmation screen: Withdrawal amount, fee, account details.
- Enter Passcode → Forgot Passcode? link available.
- Transaction Detail / E-Receipt: Withdrawal, sender = user, receiver = user's bank, amount, fee, note, QR + share + save buttons.

Note: Transfer to bank account will be charged a fee. The system will transfer approximately 1 business day after the customer has completed the transaction.

## **4.10 Visa Card**

- Navigation to Visa Card feature (from home or profile menu).
- Visa Card screen: shows card front (card number masked except last 4 digits, cardholder name, expiry, VISA logo) and card back (signature strip, CVV area).
- Initially, card shows placeholder: "CARDHOLDER NAME", "AHMED M Y ALAZAIZA" (example), "Expired Date 08/30".
- Select Address: dropdown - Current Address / Mailing Address.
- Current Address shown with green checkmark and address details.
- Optional Note field.
- Tap Request → Confirmation screen: Send Money amount (200.00 THB example), user account, fee (10.00 THB), Visa card service details, FX Rate (1 MMK/THB), Actual Sent Amount, Receiving Amount (MMK), Receiving Channel: Wave (Wallet).
- Tap Confirm → Payment Success modal ("Your payment was processed successfully! Thank you for your transaction.") → OK.
- Payment Fail modal: "Unfortunately, your payment could not be completed. Please check your details and try again." → OK.

## **4.11 Work Permit Update (2nd Document Verification)**

- Triggered when existing work permit is expiring or expired, or as part of KYC update flow.
- Work Permit screen: "2nd Document Verification" - acceptable documents: Pink Card, Work Permit Document, Oversea Worker Identification Card (OWIC), Visa.
- Rules displayed: must be valid and show expiry date, upload work permit photo, check documents before submitting.
- Camera opens → capture front of document → then back of document.
- Submit for review → KYC re-enters PENDING state.

## **4.12 System Maintenance & Software Update**

### **4.12.1 System Under Maintenance**

- Backend pushes maintenance flag → on next API call or app open, modal shown.
- Modal: "System Under Maintenance. Currently system is under maintenance. We will be back soon..." → OK.
- All transactional actions (top-up, transfer, withdraw) disabled until flag cleared.
- Read-only features (view history, exchange rates) may remain accessible per configuration.

### **4.12.2 Software Update Required**

- Backend returns min_version > current app version.
- Modal: "Software Update. A software update is required." → Quit (close app) or Now (deep link to App Store / Play Store).
- If soft update (recommended): option to dismiss once per session.
- If hard update (mandatory): Quit is the only exit; all actions blocked until updated.

## **4.13 Account Closure / Permanent Rejection**

- Permanent rejection is an admin action, not self-service account closure by user.
- Trigger: admin marks account as permanently rejected in back-office.
- Effect: phone number flagged in database as permanently_rejected = true.
- At next app open / login attempt with that number: inline red text on welcome screen + modal on Login/Register tap.
- Modal: "Registration is Rejected. Sorry, Your profile is rejected. You are no longer permitted to register again." → OK.
- All features inaccessible; only Contact Us / Need Help accessible for support.

Design consideration: Two flavors of rejection exist - (1) permanent: no re-registration, (2) correctable: 'Update Instructions' modal with Try Again. Backend must differentiate these states clearly.

# **5\. Functional Requirements**

## **5.1 Authentication & OTP**

| **ID**  | **Requirement**           | **Rule / Validation**                                                                |
| ------- | ------------------------- | ------------------------------------------------------------------------------------ |
| AUTH-01 | Phone number login        | TH (+66) prefix enforced; format: 9-10 digits after prefix                           |
| AUTH-02 | OTP generation & delivery | 6-digit; TTL 60s; SMS via gateway; log attempt                                       |
| AUTH-03 | OTP max attempts          | 5 wrong → lock 15 min; counter shown to user                                         |
| AUTH-04 | OTP resend                | Available after 60s; max 3 resends; 4th → show contact support link                  |
| AUTH-05 | Passcode setup            | 4-6 digits; no sequential (1234) or repeated (1111) patterns                         |
| AUTH-06 | Passcode verification     | Hash-compared server-side; never stored plain                                        |
| AUTH-07 | Biometric login           | iOS Face ID / Touch ID; Android Fingerprint; opt-in; fallback to passcode            |
| AUTH-08 | JWT session               | Access token 1hr; refresh token 30 days; revoked on phone change or logout           |
| AUTH-09 | Concurrent session        | Single active session per user; new login invalidates prior token                    |
| AUTH-10 | Maintenance check         | Every app open: hit /system/status before rendering home                             |
| AUTH-11 | Version check             | Every app open: compare app version vs API min_version; enforce update               |
| AUTH-12 | Rejected number gate      | Pre-login check: if permanently_rejected → block; if correctable → show instructions |

## **5.2 KYC & Identity Verification**

| **ID** | **Requirement**                 | **Rule / Validation**                                                       |
| ------ | ------------------------------- | --------------------------------------------------------------------------- |
| KYC-01 | Document types                  | Thai National ID; Passport; Work Permit; Pink Card; OWIC; Visa              |
| KYC-02 | 2nd document (work permit path) | One of: Pink Card / Work Permit Doc / OWIC / Visa; must show expiry date    |
| KYC-03 | Work permit: front & back       | Both sides captured in separate camera shots                                |
| KYC-04 | OCR accuracy                    | Auto-fill name, DOB, ID/passport number, expiry; user can correct           |
| KYC-05 | Liveness / selfie               | No glasses, no hat; face in frame; match with document photo                |
| KYC-06 | Image requirements              | Clear, original (no photocopy), not expired, no glare/blur                  |
| KYC-07 | KYC state machine               | PENDING → APPROVED \| REJECTED \| EXPIRED; REJECTED → PERMANENT \| RESUBMIT |
| KYC-08 | Rejection reasons               | Granular per document type; displayed to user in app and push notification  |
| KYC-09 | Permanent rejection gate        | Phone permanently_rejected flag → block login; no re-registration           |
| KYC-10 | Resubmit flow                   | Correctable rejection: Update Instructions modal → Try Again → restart KYC  |
| KYC-11 | KYC expiry notification         | 30-day warning push; at-login popup on expiry                               |
| KYC-12 | Work permit expiry update       | Standalone "2nd Document Verification" flow; re-enter PENDING on submit     |
| KYC-13 | Address validation              | Unit + street required; Myanmar language NOT allowed in workplace field     |
| KYC-14 | Admin SLA                       | Target review within 24 hours; escalation after 48 hours                    |

## **5.3 Wallet & Add Money**

| **ID** | **Requirement**        | **Rule / Validation**                                                      |
| ------ | ---------------------- | -------------------------------------------------------------------------- |
| WAL-01 | Balance display        | Real-time; show/hide toggle (eye icon); currency THB                       |
| WAL-02 | Max wallet balance     | 25,000 THB (admin-configurable)                                            |
| WAL-03 | Min top-up             | 150 THB                                                                    |
| WAL-04 | QR channels            | SCB, KTB, BAY, BBL, KBANK, GSB via 2C2P API                                |
| WAL-05 | 123 Service channels   | Big C, CenPay, Pay@Post, Robinson, Tesco Lotus                             |
| WAL-06 | QR payload             | Contains Ref.1 (payment code), Ref.2 (mobile), amount, pay-before, barcode |
| WAL-07 | QR expiry              | Per 2C2P pay-before timestamp; expired QR → user must regenerate           |
| WAL-08 | Webhook idempotency    | Ref1+Ref2 dedup; duplicate webhook → 200 OK but no double credit           |
| WAL-09 | Wallet ID              | 18-digit system-generated; immutable; copyable with toast                  |
| WAL-10 | KYC-pending top-up cap | Lower limit configurable; block at cap with message                        |

## **5.4 Transfers (P2P & A/C)**

| **ID** | **Requirement**          | **Rule / Validation**                                                         |
| ------ | ------------------------ | ----------------------------------------------------------------------------- |
| TXN-01 | P2P transfer             | Wallet ID to Wallet ID; THB; instant settlement                               |
| TXN-02 | P2P via QR scan          | Receiver QR → sender camera → auto-populate receiver details → amount modal   |
| TXN-03 | A/C transfer channels    | Home Bank Account, Wave App, Wave Agent, Cash Pick-up (Bank/Agent/Yoma)       |
| TXN-04 | Cash Pick-up secret code | System-generated alphanumeric; displayed on receipt; copy + refresh available |
| TXN-05 | Exchange rate            | Live THB→MMK before confirmation; cached if API down; block submit if stale   |
| TXN-06 | Passcode confirmation    | Required for every transfer; biometric if enabled                             |
| TXN-07 | Daily / monthly limit    | Enforced; remaining shown in limit screen; 422 if exceeded                    |
| TXN-08 | Transfer purpose         | Mandatory dropdown for all transfers                                          |
| TXN-09 | Relationship with sender | Mandatory for A/C and cash pick-up transfers                                  |
| TXN-10 | Fees                     | Displayed before confirmation; included in sent amount calculation            |
| TXN-11 | Duplicate transfer guard | Same wallet+amount within 60s → confirmation dialog                           |
| TXN-12 | E-Receipt                | Auto-generated post-success; shareable; shows all transaction details         |
| TXN-13 | Rejected transfer        | Reason in history detail; push notification sent                              |

## **5.5 Recipient Management**

| **ID** | **Requirement**                             | **Rule / Validation**                                                            |
| ------ | ------------------------------------------- | -------------------------------------------------------------------------------- |
| REC-01 | Recipient fields - Bank Account             | Bank name, account number, account name, first/last name, occupation, purpose    |
| REC-02 | Recipient fields - Cash Pick-up (Yoma Bank) | First/last name, NRC, phone (MM +95), occupation, purpose, relationship, address |
| REC-03 | NRC format                                  | State code / Township abbreviation / N or E / 6 digits; validated                |
| REC-04 | Myanmar address cascade                     | State Division → Township → Band and Village; cascading dropdowns                |
| REC-05 | Favourite                                   | Star toggle; sorted to top of list; persisted                                    |
| REC-06 | Edit                                        | All fields editable except transfer type; save updates immediately               |
| REC-07 | Delete                                      | Confirmation dialog; soft-delete; historical transactions preserve snapshot      |
| REC-08 | Search                                      | By name or phone number; real-time filter                                        |
| REC-09 | Create inline                               | Can create new recipient from within transfer flow without leaving               |

## **5.6 Withdrawal**

| **ID** | **Requirement**         | **Rule / Validation**                                          |
| ------ | ----------------------- | -------------------------------------------------------------- |
| WD-01  | Bank selection          | Dropdown: 10+ Thai banks; search/scroll supported              |
| WD-02  | Bank account management | Multiple accounts per user; add / delete (with confirm dialog) |
| WD-03  | Delete bank account     | Cannot delete if pending withdrawal uses that account          |
| WD-04  | Fee disclosure          | Fee shown on confirmation screen before passcode entry         |
| WD-05  | Settlement time         | 1 business day; displayed as note on screen                    |
| WD-06  | Passcode                | Required; Forgot Passcode link available on passcode screen    |
| WD-07  | Min / max withdrawal    | Min: 1 THB; max: configurable per KYC tier                     |
| WD-08  | E-Receipt               | Generated post-success; includes QR; save + share options      |

## **5.7 Visa Card**

| **ID**  | **Requirement**   | **Rule / Validation**                                                               |
| ------- | ----------------- | ----------------------------------------------------------------------------------- |
| VISA-01 | Card display      | Front: number (masked), name, expiry; Back: signature strip, CVV (hidden until tap) |
| VISA-02 | Address selection | Current Address or Mailing Address; Current Address shown with green checkmark      |
| VISA-03 | Fee               | 10 THB per transaction; displayed on confirmation                                   |
| VISA-04 | FX conversion     | THB deducted; MMK equivalent shown; Wave (Wallet) receiving channel                 |
| VISA-05 | Payment Success   | Modal confirmation; OK returns to card screen                                       |
| VISA-06 | Payment Fail      | Modal with reason; user prompted to check details and retry                         |
| VISA-07 | Eligibility       | KYC Approved users only; linked to KYC-verified identity                            |

## **5.8 Transaction History & E-Receipts**

| **ID**  | **Requirement**                     | **Rule / Validation**                                                    |
| ------- | ----------------------------------- | ------------------------------------------------------------------------ |
| HIST-01 | Filter options                      | All / This week / Last month / Last year / Custom date range             |
| HIST-02 | Calendar picker                     | Interactive month calendar; tap start + end date; Apply / Cancel         |
| HIST-03 | Status display                      | Success (green), Pending (yellow), Rejected (red)                        |
| HIST-04 | E-Receipt fields                    | Vary by transaction type; always include transaction ID + license number |
| HIST-05 | Cash Pick-up secret code on receipt | Code shown with copy icon; refresh icon to re-request code               |
| HIST-06 | Share                               | Native OS share sheet; receipt as image or PDF                           |
| HIST-07 | Retention                           | 7 years regulatory minimum; paginated load (20 per page)                 |
| HIST-08 | Pending auto-refresh                | Pending transactions auto-refresh every 30s or on screen resume          |

## **5.9 System Maintenance & Software Update**

| **ID** | **Requirement**    | **Rule / Validation**                                                           |
| ------ | ------------------ | ------------------------------------------------------------------------------- |
| SYS-01 | Maintenance flag   | Server-side; checked on every app open and after each API error                 |
| SYS-02 | Maintenance modal  | Non-dismissible (except OK which shows static screen); no transactional actions |
| SYS-03 | Soft update        | Recommended; "Later" option available; shown max once per session               |
| SYS-04 | Hard update        | Mandatory; only Quit or Now; all features locked until updated                  |
| SYS-05 | Version comparison | Semantic versioning; API returns min_version and recommended_version            |
| SYS-06 | Deep link          | Now button: iOS → App Store page; Android → Play Store page                     |

## **5.10 Notifications**

| **ID**   | **Event**               | **Channel**        | **Content**                                                  |
| -------- | ----------------------- | ------------------ | ------------------------------------------------------------ |
| NOTIF-01 | Top-up success          | Push + In-app      | "Your wallet has been credited with X THB"                   |
| NOTIF-02 | Transfer success        | Push + In-app      | "Transfer of X THB completed successfully"                   |
| NOTIF-03 | Transfer rejected       | Push + In-app      | "Your transfer was rejected. Tap to view details."           |
| NOTIF-04 | Withdrawal success      | Push + In-app      | "Withdrawal of X THB processed"                              |
| NOTIF-05 | KYC approved            | Push + In-app      | "Your KYC is approved. Full features unlocked."              |
| NOTIF-06 | KYC rejected            | Push + In-app      | "KYC not approved. Check your profile for reasons."          |
| NOTIF-07 | KYC expiry warning      | Push + In-app      | "Your KYC expires in 30 days. Update now."                   |
| NOTIF-08 | Referral payout         | Push + In-app      | "Your referral reward of X THB has been added."              |
| NOTIF-09 | Maintenance start       | Push (if possible) | "System maintenance scheduled. Some features unavailable."   |
| NOTIF-10 | Security - phone change | SMS to old number  | "Your phone number was changed. Contact support if not you." |

# **6\. Non-Functional Requirements**

| **Category**      | **Requirement**                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Performance       | API p95 < 2s; QR generation < 3s; home load < 1.5s; E-receipt render < 1s                          |
| Availability      | 99.9% uptime SLA; planned maintenance window communicated 48hr in advance via push notification    |
| Scalability       | 50,000+ concurrent users; horizontal auto-scaling; CDN for static assets                           |
| Security          | TLS 1.3 in transit; AES-256 at rest; PII masked in all logs; no card numbers in logs; JWT rotation |
| Compliance        | BOT e-money regulations; PDPA (Thailand); AML/KYC; PCI-DSS for Visa card flows                     |
| Localisation      | Thai, Myanmar (Unicode + Zawgyi auto-detect), English; all screens 100% translated                 |
| Accessibility     | WCAG 2.1 AA; min tap target 44×44pt; contrast ratio > 4.5:1; screen reader labels                  |
| Offline Handling  | Cached exchange rates with staleness indicator; queue transactions; graceful error messages        |
| Data Retention    | Transactions: 7 years; KYC documents: 5 years post-account closure; logs: 90 days                  |
| Backup & Recovery | Daily snapshots; RTO < 4 hrs; RPO < 1 hr                                                           |
| Device Support    | iOS 14+; Android 8+; min 2GB RAM; tested on Samsung A-series, Xiaomi Redmi                         |
| App Bundle Size   | < 80 MB download; < 200 MB installed                                                               |
| Crash-Free Rate   | \> 99.5%; monitored via Firebase Crashlytics; alerting on > 0.5% crash rate                        |

# **7\. API Design (High-Level)**

## **7.1 System / Auth**

| **Method** | **Endpoint**          | **Description**             | **Key Fields**                                     |
| ---------- | --------------------- | --------------------------- | -------------------------------------------------- |
| GET        | /system/status        | Maintenance & version check | → is_maintenance, min_version, recommended_version |
| POST       | /auth/otp/send        | Send OTP                    | phone_number, country_code                         |
| POST       | /auth/otp/verify      | Verify OTP → JWT            | phone_number, otp → access_token, refresh_token    |
| POST       | /auth/passcode/verify | Passcode login              | passcode_hash → session confirmed                  |
| POST       | /auth/token/refresh   | Refresh JWT                 | refresh_token → new access_token                   |
| POST       | /auth/logout          | Revoke session              | Authorization header                               |
| PUT        | /auth/passcode/change | Change passcode             | old_hash, new_hash                                 |
| POST       | /auth/phone/change    | Change phone                | new_phone, otp, passcode_hash                      |

## **7.2 KYC**

| **Method** | **Endpoint**            | **Description**                      | **Key Fields**                                |
| ---------- | ----------------------- | ------------------------------------ | --------------------------------------------- |
| POST       | /kyc/submit             | Initial KYC submission               | doc_type, images\[\], selfie, personal_info{} |
| POST       | /kyc/work-permit/update | Work permit 2nd doc update           | doc_type, front_image, back_image             |
| GET        | /kyc/status             | Get KYC status                       | → status, rejection_reasons\[\], expiry_date  |
| GET        | /kyc/rejection-reasons  | Get reason codes                     | → reasons\[\] with codes and messages         |
| POST       | /kyc/resubmit           | Resubmit after correctable rejection | Same as /kyc/submit                           |

## **7.3 Wallet & Payments**

| **Method** | **Endpoint**              | **Description**                       | **Key Fields**                                                      |
| ---------- | ------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| GET        | /wallet/balance           | Get balance + limits                  | → balance, wallet_id, max_balance, max_topup                        |
| POST       | /wallet/topup/qr          | Generate top-up QR                    | amount, channel → qr_payload, ref1, ref2, expires_at, barcode       |
| POST       | /wallet/topup/webhook     | 2C2P payment callback                 | ref1, ref2, amount, status (internal endpoint)                      |
| POST       | /wallet/transfer/p2p      | P2P wallet transfer                   | receiver_wallet_id, amount, note, passcode_hash                     |
| POST       | /wallet/transfer/account  | A/C transfer (domestic/international) | recipient_id, amount, channel, purpose, relationship, passcode_hash |
| POST       | /wallet/withdraw          | Withdrawal to bank                    | bank_account_id, amount, note, passcode_hash                        |
| POST       | /wallet/visa/request      | Visa card payment request             | amount, address_type, note                                          |
| GET        | /wallet/transactions      | Transaction history                   | page, limit, type, date_from, date_to → transactions\[\]            |
| GET        | /wallet/transactions/{id} | Transaction detail + e-receipt        | → receipt_data{}                                                    |
| GET        | /wallet/exchange-rate     | Live FX rate                          | from_currency, to_currency → rate, timestamp                        |

## **7.4 Recipients & Bank Accounts**

| **Method** | **Endpoint**               | **Description**           | **Key Fields**                                 |
| ---------- | -------------------------- | ------------------------- | ---------------------------------------------- |
| GET        | /recipients                | List recipients           | search, type, favourite → recipients\[\]       |
| POST       | /recipients                | Create recipient          | transfer_type, personal_info{}, bank_details{} |
| PUT        | /recipients/{id}           | Update recipient          | Partial update                                 |
| DELETE     | /recipients/{id}           | Soft-delete recipient     | → 204                                          |
| PATCH      | /recipients/{id}/favourite | Toggle favourite          | is_favourite: bool                             |
| GET        | /bank-accounts             | List user's bank accounts | → bank_accounts\[\]                            |
| POST       | /bank-accounts             | Add bank account          | bank_code, account_no, account_name            |
| DELETE     | /bank-accounts/{id}        | Remove bank account       | Check no pending withdrawals                   |

## **7.5 Referral & Profile**

| **Method** | **Endpoint**             | **Description**        | **Key Fields**                                      |
| ---------- | ------------------------ | ---------------------- | --------------------------------------------------- |
| GET        | /referral/stats          | Monthly stats + QR     | → month, count, referral_url, qr_payload            |
| GET        | /profile                 | Get profile            | → name, phone, kyc_status, language_pref, photo_url |
| PUT        | /profile/language        | Update language        | language: en\|th\|mm                                |
| POST       | /profile/photo           | Upload profile photo   | multipart/form-data image                           |
| GET        | /notifications           | Notification list      | page, limit → notifications\[\]                     |
| PATCH      | /notifications/{id}/read | Mark notification read |                                                     |

# **8\. Data Model (High-Level)**

| **Entity**   | **Key Fields**                                                                                                                                                                                                                           | **Relationships**                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| User         | user_id, phone_number, kyc_status (PENDING/APPROVED/REJECTED/EXPIRED), rejection_type (PERMANENT/RESUBMIT), language_pref, created_at, is_active                                                                                         | 1:1 KYC, 1:1 Wallet, 1:N Recipients, 1:N BankAccounts, 1:N Transactions, 1:1 Referral |
| KYC          | kyc_id, user_id, doc_type, doc_front_url, doc_back_url, selfie_url, work_permit_url (front/back), status, rejection_reasons\[\], expiry_date, reviewed_by, reviewed_at, submission_count                                                 | M:1 User                                                                              |
| Wallet       | wallet_id (18-digit), user_id, balance (decimal), currency (THB), max_balance, is_active, created_at                                                                                                                                     | 1:1 User, 1:N Transactions, 1:N TopupQRs                                              |
| Transaction  | txn_id, wallet_id, type (TOPUP/P2P/ACCOUNT_TRANSFER/WITHDRAWAL/VISA_PAYMENT), channel, amount_thb, amount_mmk, fx_rate, fee, status (PENDING/SUCCESS/REJECTED), ref1, ref2, secret_code, recipient_id (nullable), created_at, metadata{} | M:1 Wallet, M:1 Recipient                                                             |
| TopupQR      | qr_id, wallet_id, amount, channel, qr_payload, barcode, ref1, ref2, expires_at, status (PENDING/PAID/EXPIRED)                                                                                                                            | M:1 Wallet                                                                            |
| Recipient    | recipient_id, user_id, transfer_type, first_name, last_name, bank_code, account_no, nrc, phone_mm, occupation, purpose, relationship, address{state,township,village}, is_favourite, is_deleted, created_at                              | M:1 User                                                                              |
| BankAccount  | bank_account_id, user_id, bank_code, account_no, account_name, is_default, created_at                                                                                                                                                    | M:1 User                                                                              |
| VisaCard     | card_id, user_id, card_number (masked), cardholder_name, expiry, status (ACTIVE/INACTIVE)                                                                                                                                                | 1:1 User                                                                              |
| Referral     | referral_id, referrer_id, referred_user_id, status, created_at, payout_date, payout_amount_thb                                                                                                                                           | M:1 User (x2)                                                                         |
| Notification | notif_id, user_id, type, title, body, is_read, deep_link, created_at                                                                                                                                                                     | M:1 User                                                                              |
| SystemConfig | key (maintenance_mode, min_version, recommended_version, max_wallet_balance, topup_limits{}), value, updated_at                                                                                                                          | Singleton-like config table                                                           |

# **9\. Edge Cases & Failure Handling**

| **Scenario**                                    | **Expected System Behavior**                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Network drops during QR generation              | Retry button shown; wallet NOT pre-charged; no partial state                                                   |
| 2C2P webhook duplicate (same ref1+ref2)         | Idempotency key check; second call returns 200 but no wallet credit                                            |
| App killed during KYC document upload           | Resume from last completed step; partial uploads held server-side 24hr                                         |
| OTP delivery fails (SMS gateway down)           | After 3 failed resends → display call center / Messenger / contact links                                       |
| Maintenance flag set while user is mid-transfer | On next API call → intercept with maintenance modal; transfer not processed; no funds moved                    |
| Soft update: user dismisses update              | Allow session to continue; re-prompt next session; do not block transactions                                   |
| Hard update: user taps Quit                     | App closes; on reopen, same modal; must update to proceed                                                      |
| Permanent rejection: user tries new SIM         | Phone number is the key; different number = new account allowed (fraud risk managed by KYC)                    |
| Cash pick-up secret code lost                   | Refresh icon on receipt regenerates code; old code invalidated                                                 |
| Exchange rate stale / API down                  | Show last cached rate with timestamp; warn user; disable submit until refreshed                                |
| Wallet balance reaches exact max (25,000)       | Block top-up showing remaining = 0; allow withdrawal first                                                     |
| Transfer to self (same wallet ID)               | Backend validates sender ≠ receiver; return 422 with message                                                   |
| Bank account delete with pending withdrawal     | Block deletion: 'Cannot delete - pending withdrawal in progress'                                               |
| Selfie face not detected                        | Camera overlay re-prompts; max 3 attempts before forcing re-upload                                             |
| Race condition: two concurrent transfers        | Optimistic lock on wallet balance; second transfer returns 422 if balance insufficient after first             |
| Session expires during passcode screen          | Silently refresh token in background; if refresh fails, re-authenticate from OTP                               |
| Myanmar NRC format invalid on recipient form    | Inline field error; prevent form submission until corrected                                                    |
| Visa payment fail mid-flow                      | Payment Fail modal; no THB deducted if fail before confirmation; if post-confirmation fail, refund within 24hr |

# **10\. Risks & Mitigation**

| **Risk**                                        | **Prob.** | **Impact** | **Mitigation**                                                              |
| ----------------------------------------------- | --------- | ---------- | --------------------------------------------------------------------------- |
| 2C2P gateway outage                             | Low       | Critical   | Retry queue; user messaging; SLA; status page                               |
| KYC fraud / deepfake selfie                     | Med       | High       | Liveness detection SDK; ML fraud scoring; manual review queue               |
| BOT regulatory change                           | Med       | High       | Compliance officer monitors circulars; configurable limits via admin        |
| OCR failure on damaged documents                | High      | Med        | Manual field entry fallback; admin override; user guidance tips             |
| SMS OTP failure to Myanmar SIMs on Thai network | Med       | Med        | Secondary SMS gateway; in-app messaging fallback                            |
| PII data breach                                 | Low       | Critical   | Encryption at rest/transit; pen-testing bi-annually; incident response plan |
| App store rejection                             | Low       | Med        | Pre-submission checklist; biometric/consent UX legal review                 |
| Currency FX API downtime                        | Med       | Med        | Cached rates; stale indicator; transfer blocking on stale data              |
| Low referral conversion                         | Med       | Low        | A/B test incentive; improve share UX; track funnel analytics                |
| Myanmar Zawgyi/Unicode rendering issues         | Med       | Med        | Auto-detect font encoding; test on Myanmar devices                          |

# **11\. Release Plan TBD**

## **11.1 MVP - v1.0**

- Registration + OTP + KYC (Thai ID + Passport/Work Permit)
- Wallet balance, top-up via QR (bank apps only)
- P2P wallet transfer (manual + QR scan)
- A/C Transfer: Wave App + Wave Agent (international MMK)
- Withdrawal to Thai bank account
- Transaction history + E-receipts
- Recipient management (create/edit/delete/favourite)
- Profile: language, passcode, biometric, contact us
- Push notifications: transactions + KYC
- System maintenance + software update modals

## **11.2 v1.1 - Phase 2**

- 123 Service top-up (Big C, CenPay, Pay@Post, Robinson, Tesco Lotus)
- KYC expiry + work permit update (2nd document re-verification)
- Phone number change (both flows)
- Referral program (QR + link share + monthly payout)
- Cash Pick-up at Bank / Agent / Yoma Bank channel
- Manage personal spending limits
- Rejected / permanent rejection states (all entry points)

## **11.3 v2.0 - Phase 3 (Current Design Set)**

- Visa Card feature: request, address selection, FX payment, success/fail modals
- Enhanced e-receipts: secret code for cash pick-up, share as image/PDF
- Full transaction history with calendar date-range filter
- Work permit 2nd document capture: front + back camera flow
- Improved rejection UX: "Update Instructions" + Try Again vs permanent block

## **11.4 v2.x - Roadmap**

- In-app chat support
- QA session / FAQ
- Promotional voucher system
- Statement download (PDF)
- Bill payments
- Admin mobile companion app