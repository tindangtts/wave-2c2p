/**
 * Demo mode utilities — allows the app to run without Supabase.
 * Activated by DEMO_MODE=true in .env.local
 */

export const isDemoMode = process.env.DEMO_MODE === 'true'

export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@wave2c2p.com',
  phone: '+66992345678',
}

export const DEMO_PROFILE = {
  id: DEMO_USER.id,
  full_name: 'Lalita Tungtrakul',
  phone: DEMO_USER.phone,
  country_code: '+66',
  date_of_birth: '1995-03-15',
  preferred_language: 'en',
  kyc_status: 'approved',
  passcode_hash: '', // demo mode skips verification
  created_at: '2024-06-01T10:00:00Z',
  updated_at: '2024-12-01T10:00:00Z',
}

export const DEMO_WALLET = {
  id: 'wallet-001',
  user_id: DEMO_USER.id,
  balance: 1000000, // 10,000.00 THB in satang
  currency: 'THB',
  wallet_id: 'WAVE-8989-9890',
  created_at: '2024-06-01T10:00:00Z',
}

export const DEMO_TRANSACTIONS: import('@/types').Transaction[] = [
  {
    id: 'tx-001',
    user_id: DEMO_USER.id,
    type: 'add_money',
    status: 'success',
    amount: 500000,
    currency: 'THB',
    reference_number: 'TXN-1718272800-0001',
    description: 'Add Money via SCB',
    created_at: '2024-06-15T10:30:00Z',
    updated_at: '2024-06-15T10:30:00Z',
  },
  {
    id: 'tx-002',
    user_id: DEMO_USER.id,
    type: 'send_money',
    status: 'success',
    amount: 120000,
    currency: 'THB',
    fee: 1000,
    channel: 'wave_app',
    converted_amount: 1596000,
    converted_currency: 'MMK',
    exchange_rate: 133.0,
    recipient_id: 'rcpt-001',
    reference_number: 'TXN-1718272800-0002',
    description: 'Send Money : Wallet Transfer',
    created_at: '2024-06-12T09:10:00Z',
    updated_at: '2024-06-12T09:10:00Z',
  },
  {
    id: 'tx-003',
    user_id: DEMO_USER.id,
    type: 'send_money',
    status: 'rejected',
    amount: 50000,
    currency: 'THB',
    fee: 1000,
    channel: 'wave_agent',
    converted_amount: 665000,
    converted_currency: 'MMK',
    exchange_rate: 133.0,
    recipient_id: 'rcpt-002',
    reference_number: 'TXN-1718272800-0003',
    description: 'Transfer to Myanmar',
    created_at: '2024-06-10T14:20:00Z',
    updated_at: '2024-06-10T14:20:00Z',
  },
  {
    id: 'tx-004',
    user_id: DEMO_USER.id,
    type: 'withdraw',
    status: 'success',
    amount: 200000,
    currency: 'THB',
    fee: 2500,
    reference_number: 'WTHD-1718272800-0004',
    description: 'Withdrawal to Sam Smith',
    created_at: '2024-06-08T16:45:00Z',
    updated_at: '2024-06-08T16:45:00Z',
  },
  {
    id: 'tx-005',
    user_id: DEMO_USER.id,
    type: 'add_money',
    status: 'pending',
    amount: 300000,
    currency: 'THB',
    reference_number: 'TXN-1718272800-0005',
    description: 'Add Money via KTB',
    created_at: '2024-06-05T08:00:00Z',
    updated_at: '2024-06-05T08:00:00Z',
  },
]

export const DEMO_RECIPIENTS: import('@/types').Recipient[] = [
  {
    id: 'rcpt-001',
    user_id: DEMO_USER.id,
    first_name: 'Min',
    last_name: 'Zaw',
    full_name: 'Min Zaw',
    phone: '+959999555',
    country_code: '+95',
    transfer_type: 'wave_app',
    is_favorite: true,
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'rcpt-002',
    user_id: DEMO_USER.id,
    first_name: 'Sam',
    last_name: 'Smith',
    full_name: 'Sam Smith',
    phone: '+959888444',
    country_code: '+95',
    transfer_type: 'bank_transfer',
    bank_name: 'KBZ Bank',
    account_no: '0123456789',
    is_favorite: false,
    created_at: '2024-06-02T10:00:00Z',
    updated_at: '2024-06-02T10:00:00Z',
  },
  {
    id: 'rcpt-003',
    user_id: DEMO_USER.id,
    first_name: 'Vy',
    last_name: 'Savanntepy',
    full_name: 'Vy Savanntepy',
    phone: '+959777333',
    country_code: '+95',
    transfer_type: 'cash_pickup',
    is_favorite: true,
    created_at: '2024-06-03T10:00:00Z',
    updated_at: '2024-06-03T10:00:00Z',
  },
]
