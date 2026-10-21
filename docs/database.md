# FinGuard – TrustFlow: Database Schema & Migration Guide

## PostgreSQL Tables

### 1. `users`
* `id` VARCHAR(64) PRIMARY KEY
* `name` VARCHAR(255) NOT NULL
* `email` VARCHAR(255) UNIQUE NOT NULL
* `password_hash` VARCHAR(255) NOT NULL
* `role` VARCHAR(50) DEFAULT 'freelancer'
* `country` VARCHAR(100) DEFAULT 'India'
* `default_source_currency` VARCHAR(10) DEFAULT 'USD'
* `default_destination_currency` VARCHAR(10) DEFAULT 'INR'
* `business_name` VARCHAR(255)
* `wallet_address` VARCHAR(100)
* `created_at`, `updated_at` TIMESTAMP WITH TIME ZONE

### 2. `exchange_rate_snapshots`
* `id` VARCHAR(64) PRIMARY KEY
* `source_currency`, `destination_currency` VARCHAR(10)
* `base_exchange_rate`, `effective_rate` NUMERIC(16, 6)
* `expires_at` TIMESTAMP WITH TIME ZONE

### 3. `payment_quotes`
* `id` VARCHAR(64) PRIMARY KEY
* `user_id` VARCHAR(64) REFERENCES users(id)
* `source_amount`, `gross_destination_amount`, `estimated_recipient_amount` NUMERIC(16, 2)
* `exchange_rate` NUMERIC(16, 6)
* `service_fee_source`, `conversion_fee_destination` NUMERIC(16, 2)
* `formula_description` TEXT
* `expires_at` TIMESTAMP WITH TIME ZONE

### 4. `payment_requests`
* `id` VARCHAR(64) PRIMARY KEY
* `user_id` VARCHAR(64) REFERENCES users(id)
* `quote_id` VARCHAR(64) REFERENCES payment_quotes(id)
* `client_name`, `client_email`, `client_country` VARCHAR
* `invoice_number`, `project_title` VARCHAR
* `status` VARCHAR(50) (DRAFT, CONFIRMED)

### 5. `transactions`
* `id` VARCHAR(64) PRIMARY KEY
* `payment_request_id` VARCHAR(64) REFERENCES payment_requests(id)
* `user_id` VARCHAR(64) REFERENCES users(id)
* `reference_code` VARCHAR(100) UNIQUE
* `source_amount`, `destination_amount`, `total_fees` NUMERIC(16, 2)
* `status` VARCHAR(50) (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
* `blockchain_status` VARCHAR(50)
* `blockchain_tx_hash` VARCHAR(128)

### 6. `transaction_status_history`
* `id` VARCHAR(64) PRIMARY KEY
* `transaction_id` VARCHAR(64) REFERENCES transactions(id)
* `from_status`, `to_status` VARCHAR(50)
* `actor_id`, `actor_role` VARCHAR
* `reason` TEXT
* `is_simulated` BOOLEAN

### 7. `blockchain_records`
* `id` VARCHAR(64) PRIMARY KEY
* `transaction_id` VARCHAR(64) REFERENCES transactions(id)
* `payment_reference`, `metadata_hash`, `contract_address`, `transaction_hash` VARCHAR
* `network_name` VARCHAR(100), `chain_id` INTEGER
* `block_number` BIGINT, `confirmed` BOOLEAN

### 8. `audit_logs`
* `id` VARCHAR(64) PRIMARY KEY
* `user_id` VARCHAR(64), `action` VARCHAR(100)
* `details` JSONB, `created_at` TIMESTAMP
