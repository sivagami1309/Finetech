# FinGuard – TrustFlow: Production Deployment Guide

## Architecture Deployment Strategy
* **Frontend**: Vercel (or static SPA CDN)
* **Backend**: Render Web Service (Node.js runtime)
* **Database**: Neon PostgreSQL / Supabase PostgreSQL
* **Blockchain**: Polygon Amoy Testnet (Chain ID 80002)

## 1. Database Provisioning (Neon / Supabase)
1. Create a PostgreSQL project on Neon.tech or Supabase.
2. Obtain the standard pooled connection string:
   `postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB]?sslmode=require`
3. Execute the migration file `backend/migrations/001_initial_schema.sql` via psql or database web SQL console.

## 2. Backend Deployment on Render
1. Connect your GitHub repository to Render.
2. Create a **Web Service**:
   * **Runtime**: Node
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
3. Add Environment Variables:
   * `NODE_ENV=production`
   * `PORT=3000`
   * `DATABASE_URL=postgresql://...`
   * `JWT_SECRET=[64-char random string]`
   * `POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/`
   * `POLYGON_AMOY_CHAIN_ID=80002`
   * `CONTRACT_ADDRESS=0x217d83E71c5324D69B0C522B2945dC3806Fa6a85`
   * `BLOCKCHAIN_SIGNER_PRIVATE_KEY=[Your test wallet key with Amoy POL]`

## 3. Frontend Deployment on Vercel
1. Import repository to Vercel.
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
