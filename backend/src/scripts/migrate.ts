import fs from 'fs';
import path from 'path';
import { getDbPool, getDbStatus } from '../config/db';

async function runMigrations() {
  console.log('==================================================');
  console.log('Running FinGuard – TrustFlow Database Migrations');
  console.log('==================================================');

  try {
    const status = await getDbStatus();
    console.log(`[Database Engine]: ${status.engine} (${status.mode})`);

    const pool = await getDbPool();

    if (process.env.DATABASE_URL) {
      const migrationFile = path.resolve(process.cwd(), 'backend/migrations/001_initial_schema.sql');
      const sql = fs.readFileSync(migrationFile, 'utf8');
      console.log(`Executing migration file 001_initial_schema.sql on live PostgreSQL...`);
      await pool.query(sql);
    }

    const verifiedStatus = await getDbStatus();
    console.log(`[Migration Result]: ${verifiedStatus.tables.length} tables verified:`);
    verifiedStatus.tables.forEach((t) => console.log(`  ✓ ${t}`));
    console.log('Database schema is fully in sync and ready.');
    process.exit(0);
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

runMigrations();
