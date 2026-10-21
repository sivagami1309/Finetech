import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'finguard_trustflow_hackathon_super_secret_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  cookieSettings: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  polygonAmoy: {
    rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/',
    chainId: parseInt(process.env.POLYGON_AMOY_CHAIN_ID || '80002', 10),
    contractAddress: process.env.CONTRACT_ADDRESS || '0x217d83E71c5324D69B0C522B2945dC3806Fa6a85',
    signerPrivateKey: process.env.BLOCKCHAIN_SIGNER_PRIVATE_KEY || '',
    explorerUrl: 'https://amoy.polygonscan.com',
  },
};

export function validateEnvironment() {
  const warnings: string[] = [];
  if (!process.env.DATABASE_URL) {
    warnings.push('DATABASE_URL is not set. Embedded PostgreSQL engine (pg-mem) with SQL migrations enabled for local demo.');
  }
  if (!process.env.BLOCKCHAIN_SIGNER_PRIVATE_KEY) {
    warnings.push('BLOCKCHAIN_SIGNER_PRIVATE_KEY is not set. Blockchain service running in read-only and local cryptographic attestation mode for Polygon Amoy.');
  }
  return warnings;
}
