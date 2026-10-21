-- FinGuard - TrustFlow Development Seed Data
-- Fictional Freelancer & Transactions for Hackathon Demo

INSERT INTO users (id, name, email, password_hash, role, country, default_source_currency, default_destination_currency, business_name, wallet_address)
VALUES (
    'usr_dev_arjun_01',
    'Arjun Mehta',
    'arjun.mehta@freelance.dev',
    '$2b$10$Jcpaj30cUIAfYd1r8D30RudIX7hkuuWyE7Vkw6C2ry/xUtwYbkufy', -- password: password123
    'freelancer',
    'India',
    'USD',
    'INR',
    'Arjun Creative Studio LLP',
    '0x71C83a48e7C9fAc8aE8908dCeC005F999D543210'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_quotes (id, user_id, source_currency, destination_currency, source_amount, exchange_rate, gross_destination_amount, service_fee_source, conversion_fee_destination, partner_fee_destination, total_fee_source_equivalent, estimated_recipient_amount, formula_description, expires_at)
VALUES (
    'qte_dev_001',
    'usr_dev_arjun_01',
    'USD',
    'INR',
    1200.00,
    83.500000,
    100200.00,
    2.50,
    350.00,
    0.00,
    6.69,
    99850.00,
    'gross = 1200.00 * 83.50 = 100200.00 INR; fees = $2.50 USD source fee + 350.00 INR conversion fee; net = 99850.00 INR',
    CURRENT_TIMESTAMP + INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_requests (id, user_id, quote_id, client_name, client_email, client_country, invoice_number, project_title, description, source_amount, source_currency, destination_currency, status)
VALUES (
    'req_dev_001',
    'usr_dev_arjun_01',
    'qte_dev_001',
    'Apex Horizon Tech Inc.',
    'billing@apexhorizon.io',
    'United States',
    'INV-2026-089',
    'Full-Stack Design System & API Architecture',
    'Milestone 1: Prototype design system token library and Node.js microservices',
    1200.00,
    'USD',
    'INR',
    'CONFIRMED'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO transactions (id, payment_request_id, user_id, reference_code, source_amount, source_currency, destination_amount, destination_currency, exchange_rate, total_fees, status, payment_method, recipient_beneficiary_name, recipient_account_hint, blockchain_status, blockchain_tx_hash)
VALUES (
    'tx_dev_001',
    'req_dev_001',
    'usr_dev_arjun_01',
    'FG-2026-USIN-89421',
    1200.00,
    'USD',
    99850.00,
    'INR',
    83.500000,
    6.69,
    'COMPLETED',
    'Cross-Border Wire (Simulated)',
    'Arjun Mehta',
    'HDFC Bank - ••••4821',
    'VERIFIED_ON_CHAIN',
    '0x3d7b82f80164c925890289aef4112e3a1f43405c9288e2cb2ad38e6840776b92'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO transaction_status_history (id, transaction_id, from_status, to_status, actor_id, actor_role, reason, is_simulated)
VALUES 
    ('tsh_dev_001_1', 'tx_dev_001', 'DRAFT', 'PENDING', 'usr_dev_arjun_01', 'freelancer', 'Payment request confirmed by freelancer', TRUE),
    ('tsh_dev_001_2', 'tx_dev_001', 'PENDING', 'PROCESSING', 'system_settlement_worker', 'system', 'Client initiated wire transfer via automated clearing house', TRUE),
    ('tsh_dev_001_3', 'tx_dev_001', 'PROCESSING', 'COMPLETED', 'system_settlement_worker', 'system', 'Funds credited to recipient HDFC account via simulated RTGS/NEFT', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO blockchain_records (id, transaction_id, payment_reference, metadata_hash, network_name, chain_id, contract_address, transaction_hash, block_number, confirmed, verified_at, raw_event_data)
VALUES (
    'bcr_dev_001',
    'tx_dev_001',
    'FG-2026-USIN-89421',
    '0x9a83d712f5e042b8941784651347895bc632aef415668102456489379201a742',
    'Polygon Amoy Testnet',
    80002,
    '0x217d83E71c5324D69B0C522B2945dC3806Fa6a85',
    '0x3d7b82f80164c925890289aef4112e3a1f43405c9288e2cb2ad38e6840776b92',
    14829304,
    TRUE,
    CURRENT_TIMESTAMP,
    '{"event": "PaymentRecordRegistered", "paymentRef": "FG-2026-USIN-89421", "amountUSD": 1200.00, "amountINR": 99850.00, "recipient": "Arjun Mehta"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
