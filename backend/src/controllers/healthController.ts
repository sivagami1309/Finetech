import { Request, Response } from 'express';
import { getDbStatus } from '../config/db';
import { config, validateEnvironment } from '../config/env';

export class HealthController {
  public static async getSystemHealth(req: Request, res: Response): Promise<void> {
    const dbStatus = await getDbStatus();
    const envWarnings = validateEnvironment();
    const isConnected = Boolean(dbStatus.connected);

    res.status(isConnected ? 200 : 503).json({
      status: isConnected ? 'UP' : 'DEGRADED',
      database_connected: isConnected,
      database: {
        connected: isConnected,
        database_name: dbStatus.database,
        engine: dbStatus.engine,
        mode: dbStatus.mode,
        user_count: dbStatus.userCount,
      },
      application: 'FinGuard – TrustFlow',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      services: {
        api: 'HEALTHY',
        database: isConnected ? 'HEALTHY' : 'DISCONNECTED',
        blockchain: 'READY (Polygon Amoy Testnet)',
      },
      warnings: envWarnings,
    });
  }

  public static async getDatabaseHealth(req: Request, res: Response): Promise<void> {
    const dbStatus = await getDbStatus();
    res.status(dbStatus.connected ? 200 : 503).json(dbStatus);
  }

  public static async getBlockchainHealth(req: Request, res: Response): Promise<void> {
    const isSignerConfigured = Boolean(
      config.polygonAmoy.signerPrivateKey && config.polygonAmoy.signerPrivateKey.length >= 64
    );

    res.json({
      status: 'ONLINE',
      network: 'Polygon Amoy Testnet',
      chainId: config.polygonAmoy.chainId,
      rpcEndpoint: config.polygonAmoy.rpcUrl,
      contractAddress: config.polygonAmoy.contractAddress,
      isSignerConfigured,
      mode: isSignerConfigured ? 'live-network-signer' : 'cryptographic-attestation-and-query',
      explorer: config.polygonAmoy.explorerUrl,
    });
  }
}
