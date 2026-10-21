# FinGuard – TrustFlow: System Architecture

## Overview
FinGuard – TrustFlow is a transparent and verifiable cross-border payment tracking platform designed specifically for Indian freelancers receiving remittances from international clients (e.g. US, UK, EU).

## Core Architecture Layers

```
+-------------------------------------------------------------------------+
|                        Client Layer (Vite + React)                      |
|   - Recharts Visualizations  - MetaMask Web3 Integration - Tailwind CSS |
+-------------------------------------------------------------------------+
                                   | REST API (JSON)
+-------------------------------------------------------------------------+
|                  Backend Application Layer (Node.js/Express)            |
|   - State Machine Controller    - Fee Calculation Engine                |
|   - JWT Authentication          - Deterministic Metadata Hasher         |
+-------------------------------------------------------------------------+
             |                                              |
             v                                              v
+-------------------------+                   +---------------------------+
|    Authoritative DB     |                   |  Polygon Amoy Blockchain  |
|  PostgreSQL / pg pool   |                   |  Solidity Registry (80002)|
|  - Users, Quotes        |                   |  - Immutable Tx Hashes    |
|  - Requests, Audits     |                   |  - Proof-of-Settlement    |
+-------------------------+                   +---------------------------+
```

## Key Architectural Principles
1. **Mathematical Invariance**: Deductions and exchange rates are locked and immutable within the quote expiration window.
2. **Authoritative Relational Truth**: The database stores private identities, financial values, and transaction states.
3. **Decoupled Verification**: Private bank details and user identity never touch the public blockchain. Only Keccak-256 digests and references are registered on Polygon Amoy.
4. **Resilient Local Execution**: Employs an embedded PostgreSQL pool in development when live Neon or Supabase credentials are not specified, ensuring zero external dependencies during offline judging.
