# FinGuard – TrustFlow: REST API Specification

## Authentication Endpoints
* `POST /api/auth/register` — Register a new freelancer account.
* `POST /api/auth/login` — Sign in and obtain JWT Bearer token and session cookie.
* `POST /api/auth/logout` — Invalidate session cookie.
* `GET /api/auth/me` — Retrieve active authenticated user profile.

## User Endpoints
* `GET /api/users/me` — Get current user details and default payout bank configurations.
* `PATCH /api/users/me` — Update name, business entity, or default currencies.

## Payment Request & Quote Endpoints
* `POST /api/payment-requests` — Create payment request and calculate transparent fee quote.
* `GET /api/payment-requests` — List user's payment requests with pagination.
* `GET /api/payment-requests/:id` — Retrieve detailed request by ID.
* `POST /api/payment-requests/quote` — Obtain standalone transparent fee quote without persistence.
* `POST /api/payment-requests/:id/confirm` — Lock quote and transition to PENDING transaction.

## Transaction Endpoints
* `GET /api/transactions` — Query transactions with status, currency, and search filters.
* `GET /api/transactions/:id` — Retrieve transaction details, status history, and blockchain proofs.
* `GET /api/transactions/:id/history` — Retrieve timestamped audit history of state transitions.
* `POST /api/transactions/:id/simulate-status` — Advance simulated settlement lifecycle for demo.
* `GET /api/transactions/stats/dashboard` — Aggregated KPI metrics for authenticated user.

## Blockchain Endpoints
* `POST /api/blockchain/records` — Submit payment reference to Polygon Amoy contract.
* `GET /api/blockchain/records/:id` — Lookup on-chain record by transaction ID or payment reference.
* `GET /api/blockchain/verify/:transactionHash` — Cryptographically verify transaction hash or reference.

## Health Endpoints
* `GET /api/health` — Full system status, uptime, and diagnostics.
* `GET /api/health/database` — PostgreSQL connection status, table count, and engine mode.
* `GET /api/health/blockchain` — Polygon Amoy RPC endpoint, contract address, and network status.
