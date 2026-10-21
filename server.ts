import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './backend/src/app';
import { getDbPool } from './backend/src/config/db';
import { config, validateEnvironment } from './backend/src/config/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createExpressApp();
  const PORT = config.port;

  // Initialize Database Pool & apply initial SQL migrations
  console.log('--------------------------------------------------');
  console.log('FinGuard – TrustFlow Backend Initializing...');
  console.log('--------------------------------------------------');
  try {
    await getDbPool();
  } catch (err: any) {
    console.error('[Database Init Warning]', err.message);
  }

  const envWarnings = validateEnvironment();
  if (envWarnings.length > 0) {
    console.log('[System Diagnostics]:');
    envWarnings.forEach((w) => console.log(' ->', w));
  }

  if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Mount Vite dev middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('==================================================');
    console.log(` FinGuard – TrustFlow Server running on port ${PORT}`);
    console.log(` Dev URL: http://localhost:${PORT}`);
    console.log(` OpenAPI Spec: http://localhost:${PORT}/api/docs/openapi.json`);
    console.log(` Database Health: http://localhost:${PORT}/api/health/database`);
    console.log(` Blockchain Health: http://localhost:${PORT}/api/health/blockchain`);
    console.log('==================================================');
  });
}

startServer().catch((err) => {
  console.error('[Fatal Server Startup Error]', err);
  process.exit(1);
});
