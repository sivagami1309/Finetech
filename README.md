# FinGuard – TrustFlow
**Transparent and Verifiable Cross-Border Payment Tracking for Freelancers**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Polygon Amoy](https://img.shields.io/badge/Polygon_Amoy-80002-purple.svg)](https://amoy.polygonscan.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Project Introduction
**FinGuard – TrustFlow** is a production-grade, hackathon-level fintech demonstration application designed to bring mathematical fee transparency and tamper-proof blockchain verification to cross-border remittances received by Indian freelancers from international clients.

## 2. Problem Statement
Cross-border payment transparency in India remains severely flawed:
* **Hidden Foreign Exchange Spreads:** Banks and legacy platforms conceal 2.5% to 5% markups inside dynamic currency conversions.
* **Unpredictable Recipient Amounts:** An invoice for $1,500 USD yields erratic INR amounts after intermediary correspondent deductions.
* **Black-Box Wire Latency:** Freelancers wait days with no progress milestones or settlement audit trail.
* **Dispute Vulnerability:** Inability to independently verify whether a client has dispatched funds.

## 3. Proposed Solution
FinGuard – TrustFlow introduces an end-to-end transparent pipeline:
1. **Guaranteed Fee Quotes:** Mathematically itemizes base conversion rates, fixed service fees, and network conversion costs with zero undisclosed intermediary markups.
2. **Authoritative PostgreSQL State Machine:** Strict relational state transitions (`DRAFT` → `PENDING` → `PROCESSING` → `COMPLETED`) with immutable audit logging.
3. **Polygon Amoy Smart Contract Attestations:** Keccak-256 digests of transaction terms are permanently inscribed on Polygon Amoy Testnet (Chain ID 80002).
4. **Hackathon Settlement Simulator:** An interactive sandbox allowing judges to trigger settlement steps in real time.

## 4. Key Features
* **Live Exchange Rate Oracle with Transparent Deductions:** $2.50 USD fixed fee + 0.35% network conversion fee.
* **12 Dedicated Frontend Screens:** Complete coverage from landing page to on-chain proof verification.
* **Relational PostgreSQL Data Layer:** 8 normalized tables with foreign keys, indexes, and UUIDs.
* **Solidity Smart Contract (`FinGuardTrustFlow.sol`):** Event emissions, duplicate reference prevention, and role-based registry.
* **Web3 MetaMask Integration:** Real-time Polygon Amoy detection (Chain ID 80002) and wallet connectivity.
* **Recharts Financial Analytics:** Real-time volume area charts and status distribution donuts.

## 5. Technology Stack
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
* **Backend:** Node.js, Express.js, TypeScript, `pg` connection pool.
* **Authentication:** JWT, bcryptjs password hashing (10 salt rounds), secure cookies.
* **Database:** PostgreSQL (with embedded pg-mem fallback for zero-config offline runs).
* **Blockchain:** Solidity 0.8.20, ethers.js v6, Hardhat, Polygon Amoy Testnet.

## 6. Architecture
```
finguard-trustflow/
|-- frontend/src/        (React UI pages, components, contexts)
|-- backend/             (Express controllers, routes, migrations, seeds, tests)
|-- blockchain/          (Solidity smart contracts, Hardhat config, ABI)
|-- docs/                (Technical guides: architecture, API, DB, blockchain, deployment)
|-- server.ts            (Unified dev server mounting Vite & Express)
```

## 7. Project Directory Structure
```
├── backend/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seeds/
│   │   └── seed.sql
│   ├── src/
│   │   ├── config/ (db.ts, env.ts)
│   │   ├── controllers/ (auth, payment, transaction, blockchain, health)
│   │   ├── middleware/ (authMiddleware.ts)
│   │   ├── services/ (feeCalculator, transaction, blockchain, auth)
│   │   ├── routes/ (auth, payment, transaction, blockchain, health)
│   │   └── app.ts
│   └── tests/ (feeCalculator.test.ts, stateMachine.test.ts, authLogic.test.ts, blockchainLogic.test.ts)
├── blockchain/
│   ├── contracts/ (FinGuardTrustFlow.sol)
│   ├── scripts/ (deploy.ts)
│   ├── hardhat.config.ts
│   └── contractAbi.json
├── src/
│   ├── components/ (Navbar, Sidebar, StatusBadge, FeeBreakdownCard, BlockchainProofCard, MetaMaskConnector, SimulationControlModal)
│   ├── pages/ (Landing, Register, Login, Dashboard, CreateRequest, FeeQuote, PaymentConfirmation, TransactionHistory, TransactionDetails, BlockchainVerification, ProfileSettings, HelpStatus)
│   ├── contexts/ (AuthContext, ToastContext)
│   ├── services/ (api.ts)
│   ├── types/ (index.ts)
│   └── App.tsx
├── server.ts
├── package.json
└── README.md
```

## 8. Prerequisites
* Node.js v18+ or v20+ or v22+
* npm or bun
* Windows PowerShell 5.1 or 7+ (or macOS/Linux bash)
* MetaMask browser extension (optional for Web3 verification)

---

## 9. Windows PowerShell Installation Instructions
Open **PowerShell** as Administrator or standard user:

```powershell
# Step 1: Clone repository
git clone https://github.com/your-username/finguard-trustflow.git
cd finguard-trustflow

# Step 2: Install dependencies
npm install

# Step 3: Copy environment configuration
Copy-Item .env.example .env

# Step 4: Run unit tests
npm test

# Step 5: Start unified development server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 10. PostgreSQL Database Setup
FinGuard supports both:
1. **Live Cloud Database (Neon / Supabase):** Set `DATABASE_URL=postgresql://user:pass@ep-host.neon.tech/dbname` in `.env`.
2. **Embedded Zero-Config PostgreSQL Engine:** When `DATABASE_URL` is blank or unreachable, the system automatically uses `pg-mem`, running genuine PostgreSQL SQL migrations and queries in memory.

## 11. Database Migration Commands
The initial schema is located in `backend/migrations/001_initial_schema.sql`.
To apply migrations on an external PostgreSQL instance:
```powershell
psql $env:DATABASE_URL -f backend/migrations/001_initial_schema.sql
```

## 12. Development Seed Commands
Fictional freelancer data (Arjun Mehta) is seeded from `backend/seeds/seed.sql`:
```powershell
psql $env:DATABASE_URL -f backend/seeds/seed.sql
```

## 13. Running Automated Tests
FinGuard includes automated pure logic tests using Node's built-in test runner:
```powershell
npm test
```
All 10 tests verify:
* Input bounds and negative amount rejection
* Mathematical fee deductions and currency conversion accuracy
* Valid and invalid state transitions in transaction state machine
* Bcrypt password hashing & JWT signing
* Keccak-256 cryptographic metadata hashing & contract payload structure

---

## 14. Polygon Amoy Configuration
* **RPC Endpoint:** `https://rpc-amoy.polygon.technology/`
* **Chain ID:** `80002`
* **Registry Contract:** `0x217d83E71c5324D69B0C522B2945dC3806Fa6a85`
* **PolygonScan Explorer:** `https://amoy.polygonscan.com`

---

## 15. REST API Documentation
* `POST /api/auth/register` — Register freelancer account
* `POST /api/auth/login` — Sign in with email and password
* `POST /api/payment-requests` — Create payment request and calculate fee quote
* `POST /api/payment-requests/:id/confirm` — Lock quote and create transaction
* `GET /api/transactions` — List user transactions with filters & pagination
* `POST /api/transactions/:id/simulate-status` — Advance simulated settlement lifecycle
* `GET /api/blockchain/verify/:transactionHash` — Verify Polygon Amoy on-chain record
* `GET /api/health` — Complete system status and diagnostics
* OpenAPI JSON specification available live at `http://localhost:3000/api/docs/openapi.json`.

---

## 16. Hackathon Demonstration Workflow (12 Steps)
1. **User Registration:** Open `http://localhost:3000/` and click "Get Started" to register, or use 1-click login on `/login` as Arjun Mehta.
2. **Dashboard Overview:** Review aggregated USD invoice volume, completed payouts in INR, and Recharts trends.
3. **Create Payment Request:** Enter $1,500 USD for a US client.
4. **Transparent Fee Quote:** Review the fee quote (1 USD = 83.50 INR, $2.50 fixed fee, 0.35% conversion fee, net INR payout).
5. **Confirm Request:** Lock rate within the 15-minute window; creates a `PENDING` transaction.
6. **Simulate Settlement:** On the Transaction Details screen, click "Simulate Settlement Lifecycle" to advance from `PENDING` → `PROCESSING` → `COMPLETED`.
7. **Polygon Amoy Attestation:** Upon reaching `COMPLETED`, the system records a Keccak-256 metadata hash onto Polygon Amoy.
8. **Independent Blockchain Verification:** Open the Polygon Verification page, paste the reference code or transaction hash, and verify the immutable block receipt.

---

## 17. Financial and Blockchain Disclaimers
**FinGuard – TrustFlow** is a software demonstration prototype created for student hackathon purposes. It is not an authorized banking institution or money transmitter and does not execute real fiat money transfers. All payment clearing actions are simulated via deterministic software state machines. Blockchain attestations are recorded on the Polygon Amoy Testnet (Chain ID 80002) where test tokens have no monetary value.

---
**Crafted for Hackathon Excellence.**
