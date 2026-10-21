-- FinGuard - TrustFlow Initial Database Schema
-- Standard PostgreSQL DDL

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'freelancer',
    country VARCHAR(100) DEFAULT 'India',
    default_source_currency VARCHAR(10) DEFAULT 'USD',
    default_destination_currency VARCHAR(10) DEFAULT 'INR',
    business_name VARCHAR(255),
    wallet_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exchange_rate_snapshots (
    id VARCHAR(64) PRIMARY KEY,
    source_currency VARCHAR(10) NOT NULL,
    destination_currency VARCHAR(10) NOT NULL,
    base_exchange_rate NUMERIC(16, 6) NOT NULL,
    markup_percentage NUMERIC(6, 4) DEFAULT 0.0000,
    effective_rate NUMERIC(16, 6) NOT NULL,
    provider_name VARCHAR(100) DEFAULT 'FinGuard Transparent Oracle (Demo)',
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_quotes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_currency VARCHAR(10) NOT NULL,
    destination_currency VARCHAR(10) NOT NULL,
    source_amount NUMERIC(16, 2) NOT NULL,
    exchange_rate NUMERIC(16, 6) NOT NULL,
    gross_destination_amount NUMERIC(16, 2) NOT NULL,
    service_fee_source NUMERIC(16, 2) DEFAULT 0.00,
    conversion_fee_destination NUMERIC(16, 2) DEFAULT 0.00,
    partner_fee_destination NUMERIC(16, 2) DEFAULT 0.00,
    total_fee_source_equivalent NUMERIC(16, 2) NOT NULL,
    estimated_recipient_amount NUMERIC(16, 2) NOT NULL,
    formula_description TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quote_id VARCHAR(64) REFERENCES payment_quotes(id),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_country VARCHAR(100) DEFAULT 'United States',
    invoice_number VARCHAR(100),
    project_title VARCHAR(255) NOT NULL,
    description TEXT,
    source_amount NUMERIC(16, 2) NOT NULL,
    source_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    destination_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    payment_request_id VARCHAR(64) NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reference_code VARCHAR(100) UNIQUE NOT NULL,
    source_amount NUMERIC(16, 2) NOT NULL,
    source_currency VARCHAR(10) NOT NULL,
    destination_amount NUMERIC(16, 2) NOT NULL,
    destination_currency VARCHAR(10) NOT NULL,
    exchange_rate NUMERIC(16, 6) NOT NULL,
    total_fees NUMERIC(16, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(100) DEFAULT 'Cross-Border Wire (Simulated)',
    recipient_beneficiary_name VARCHAR(255) NOT NULL,
    recipient_account_hint VARCHAR(100) DEFAULT 'HDFC Bank - ••••4821',
    blockchain_status VARCHAR(50) DEFAULT 'UNRECORDED',
    blockchain_tx_hash VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_status_history (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    reason TEXT,
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blockchain_records (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100) NOT NULL,
    metadata_hash VARCHAR(128) NOT NULL,
    network_name VARCHAR(100) DEFAULT 'Polygon Amoy Testnet',
    chain_id INTEGER DEFAULT 80002,
    contract_address VARCHAR(100) NOT NULL,
    transaction_hash VARCHAR(128) NOT NULL,
    block_number BIGINT,
    confirmed BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    raw_event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(64),
    details JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_payment_requests_user ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_code);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_status_history_tx ON transaction_status_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_records_tx ON blockchain_records(transaction_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_records_ref ON blockchain_records(payment_reference);
