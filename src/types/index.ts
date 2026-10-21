export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  country?: string;
  businessName?: string;
  defaultSourceCurrency?: string;
  defaultDestinationCurrency?: string;
  walletAddress?: string;
}

export interface Quote {
  sourceAmount: number;
  sourceCurrency: string;
  destinationCurrency: string;
  exchangeRate: number;
  grossDestinationAmount: number;
  serviceFeeSource: number;
  conversionFeeDestination: number;
  partnerFeeDestination: number;
  totalFeeSourceEquivalent: number;
  estimatedRecipientAmount: number;
  formulaDescription: string;
  expiresAt: string;
}

export interface PaymentRequest {
  id: string;
  user_id?: string;
  client_name: string;
  client_email: string;
  client_country?: string;
  invoice_number?: string;
  project_title: string;
  description?: string;
  source_amount: number;
  source_currency: string;
  destination_currency: string;
  status: string;
  created_at?: string;
  quote?: Quote;
}

export interface Transaction {
  id: string;
  payment_request_id: string;
  user_id: string;
  reference_code: string;
  source_amount: number;
  source_currency: string;
  destination_amount: number;
  destination_currency: string;
  exchange_rate: number;
  total_fees: number;
  status: 'DRAFT' | 'QUOTED' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payment_method: string;
  recipient_beneficiary_name: string;
  recipient_account_hint?: string;
  blockchain_status: string;
  blockchain_tx_hash?: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
  project_title?: string;
  invoice_number?: string;
  project_description?: string;
}

export interface TransactionStatusHistory {
  id: string;
  transaction_id: string;
  from_status: string;
  to_status: string;
  actor_id: string;
  actor_role: string;
  reason?: string;
  is_simulated: boolean;
  created_at: string;
}

export interface BlockchainRecord {
  id: string;
  transaction_id: string;
  payment_reference: string;
  metadata_hash: string;
  network_name: string;
  chain_id: number;
  contract_address: string;
  transaction_hash: string;
  block_number: number;
  confirmed: boolean;
  verified_at: string;
  is_simulated_dev_record?: boolean;
  details?: string;
}

export interface DashboardStats {
  totalCount: number;
  totalVolumeUSD: number;
  completedVolumeINR: number;
  completedVolumeUSD: number;
  pendingVolumeUSD: number;
  totalFeesUSD: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
}
