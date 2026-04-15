import {
  pgTable,
  uuid,
  text,
  bigint,
  boolean,
  integer,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core'

// Convenience alias: timestamp with timezone (matches PostgreSQL timestamptz)
const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

// =========================================================================
// wallets
// Mirrors: public.wallets in supabase-schema.sql
// Monetary amounts stored as bigint (satang). Use { mode: 'number' } to
// maintain TypeScript compatibility with existing Wallet.balance: number.
// =========================================================================
export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  balance: bigint('balance', { mode: 'number' }).notNull().default(0),
  currency: text('currency').notNull().default('THB'),
  maxTopup: bigint('max_topup', { mode: 'number' }).notNull().default(2500000),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

// =========================================================================
// transactions
// Mirrors: public.transactions in supabase-schema.sql
// metadata stored as text (JSON-serialized); callers must JSON.parse/stringify.
// =========================================================================
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  currency: text('currency').notNull().default('THB'),
  convertedAmount: bigint('converted_amount', { mode: 'number' }),
  convertedCurrency: text('converted_currency'),
  exchangeRate: numeric('exchange_rate', { precision: 10, scale: 4 }),
  fee: bigint('fee', { mode: 'number' }).default(0),
  status: text('status').notNull().default('pending'),
  recipientId: uuid('recipient_id'),
  channel: text('channel'),
  referenceNumber: text('reference_number').notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

// =========================================================================
// userProfiles
// Mirrors: public.user_profiles in supabase-schema.sql (including all
// ADD COLUMN migrations from Phase 02, 15, and 17).
// id is NOT defaultRandom() — it references auth.users(id) and is set
// by the caller at insert time.
// =========================================================================
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  countryCode: text('country_code').notNull().default('+66'),
  walletId: text('wallet_id').notNull(),
  kycStatus: text('kyc_status').notNull().default('not_started'),
  language: text('language').notNull().default('en'),
  avatarUrl: text('avatar_url'),
  // Phase 02 migration columns
  firstName: text('first_name'),
  lastName: text('last_name'),
  dateOfBirth: text('date_of_birth'),
  nationality: text('nationality'),
  idType: text('id_type'),
  idNumber: text('id_number'),
  idExpiry: text('id_expiry'),
  passcodeHash: text('passcode_hash'),
  registrationComplete: boolean('registration_complete').notNull().default(false),
  registrationStep: integer('registration_step').notNull().default(1),
  passcodeAttempts: integer('passcode_attempts').notNull().default(0),
  passcodeLockedAt: timestamptz('passcode_locked_at'),
  // Phase 15 WebAuthn columns
  webauthnCredentialId: text('webauthn_credential_id'),
  webauthnPublicKey: text('webauthn_public_key'),
  webauthnCounter: bigint('webauthn_counter', { mode: 'number' }).default(0),
  webauthnChallenge: text('webauthn_challenge'),
  // Phase 17 spending limits
  dailyLimitSatang: bigint('daily_limit_satang', { mode: 'number' }).default(5000000),
  monthlyLimitSatang: bigint('monthly_limit_satang', { mode: 'number' }).default(20000000),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

// =========================================================================
// cards
// Mirrors: public.cards in supabase-schema.sql
// balance stored as bigint (satang).
// =========================================================================
export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  cardNumberMasked: text('card_number_masked').notNull(),
  cardNumberEncrypted: text('card_number_encrypted'),
  cvvEncrypted: text('cvv_encrypted'),
  expiryMonth: integer('expiry_month').notNull(),
  expiryYear: integer('expiry_year').notNull(),
  balance: bigint('balance', { mode: 'number' }).notNull().default(0),
  isFrozen: boolean('is_frozen').notNull().default(false),
  status: text('status').notNull().default('active'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
})

// =========================================================================
// recipients
// Mirrors: public.recipients in supabase-schema.sql
// =========================================================================
export const recipients = pgTable('recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  countryCode: text('country_code').notNull().default('+95'),
  nrc: text('nrc'),
  occupation: text('occupation'),
  transferPurpose: text('transfer_purpose'),
  relationship: text('relationship'),
  address: text('address'),
  isFavorite: boolean('is_favorite').notNull().default(false),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

// =========================================================================
// notifications
// Mirrors: public.notifications in supabase-schema.sql (Phase 20 migration)
// =========================================================================
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  deepLink: text('deep_link'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
})
