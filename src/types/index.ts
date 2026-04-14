// User & Auth
export interface User {
  id: string;
  phone: string;
  country_code: string;
  full_name: string;
  wallet_id: string;
  kyc_status: KYCStatus;
  language: Language;
  created_at: string;
}

export type KYCStatus = "pending" | "approved" | "rejected" | "expired" | "not_started";
export type Language = "en" | "th" | "mm";
export type TransactionStatus = "success" | "pending" | "rejected" | "processing" | "failed";
export type TransactionType = "add_money" | "send_money" | "withdraw" | "receive" | "bill_payment";
export type TransferChannel = "wave_agent" | "wave_app" | "bank_transfer" | "cash_pickup";

// Wallet
export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: "THB";
  max_topup: number;
}

// Transaction
export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  converted_amount?: number;
  converted_currency?: string;
  exchange_rate?: number;
  fee?: number;
  status: TransactionStatus;
  recipient_id?: string;
  channel?: TransferChannel;
  reference_number: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Recipient
export interface Recipient {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  country_code: string;
  nrc?: string;
  occupation?: string;
  transfer_purpose?: string;
  relationship?: string;
  address?: string;
  is_favorite: boolean;
  created_at: string;
}

// KYC
export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: "id_card" | "passport" | "work_permit" | "pink_card" | "owic" | "visa";
  front_image_url?: string;
  back_image_url?: string;
  selfie_image_url?: string;
  status: KYCStatus;
  rejection_reason?: string;
  verified_at?: string;
  expires_at?: string;
  created_at: string;
}

// Card
export interface VirtualCard {
  id: string;
  user_id: string;
  card_number_masked: string;
  card_number?: string;
  cvv?: string;
  expiry_month: number;
  expiry_year: number;
  balance: number;
  is_frozen: boolean;
  status: "active" | "inactive" | "ordered" | "delivered";
}

// Mock Service Types
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  updated_at: string;
}

export interface FeeCalculation {
  channel: TransferChannel;
  fee: number;
  currency: string;
  total_amount: number;
}

// Referral
export interface Referral {
  id: string;
  referrer_id: string;
  referee_id?: string;
  code: string;
  status: "pending" | "completed";
  reward_amount?: number;
  created_at: string;
}
