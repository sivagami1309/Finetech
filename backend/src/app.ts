import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';
import transactionRoutes from './routes/transactionRoutes';
import blockchainRoutes from './routes/blockchainRoutes';
import healthRoutes from './routes/healthRoutes';

export function createExpressApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // REST API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/payment-requests', paymentRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/blockchain', blockchainRoutes);
  app.use('/api/health', healthRoutes);

  // OpenAPI Specification endpoint
  app.get('/api/docs/openapi.json', (req: Request, res: Response) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'FinGuard – TrustFlow REST API',
        version: '1.0.0',
        description: 'Transparent and Verifiable Cross-Border Payment Tracking for Freelancers API documentation.',
      },
      paths: {
        '/api/auth/register': {
          post: { summary: 'Register a new freelancer account', tags: ['Authentication'] },
        },
        '/api/auth/login': {
          post: { summary: 'Authenticate user with email and password', tags: ['Authentication'] },
        },
        '/api/auth/me': {
          get: { summary: 'Retrieve current authenticated user session', tags: ['Authentication'] },
        },
        '/api/payment-requests': {
          post: { summary: 'Create cross-border payment request and obtain fee quote', tags: ['Payments'] },
          get: { summary: 'List user payment requests with pagination', tags: ['Payments'] },
        },
        '/api/payment-requests/{id}/confirm': {
          post: { summary: 'Confirm quote and create pending transaction record', tags: ['Payments'] },
        },
        '/api/transactions': {
          get: { summary: 'List transactions with status and currency filters', tags: ['Transactions'] },
        },
        '/api/transactions/{id}/simulate-status': {
          post: { summary: 'Advance simulated payment settlement lifecycle for demo', tags: ['Transactions'] },
        },
        '/api/blockchain/verify/{transactionHash}': {
          get: { summary: 'Verify payment reference or transaction on Polygon Amoy', tags: ['Blockchain'] },
        },
        '/api/health': {
          get: { summary: 'Inspect system, database, and blockchain status', tags: ['Health'] },
        },
      },
    });
  });

  // Centralized sanitized error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[API Server Error]', err.message);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'An internal server error occurred.',
    });
  });

  return app;
}
