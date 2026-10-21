import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { newDb } from 'pg-mem';

const { Pool } = pg;

export interface IDatabaseStatus {
  connected: boolean;
  engine: string;
  mode: 'live-postgres' | 'in-memory-pg-compatible';
  tables: string[];
  error?: string;
}

let activePool: {
  query: (text: string, params?: any[]) => Promise<any>;
  connect?: () => Promise<any>;
};

let dbMode: 'live-postgres' | 'in-memory-pg-compatible' = 'in-memory-pg-compatible';
let isInitialized = false;

// Initialize pg-mem in-memory postgres instance for zero-dependency local hackathon execution
function createPgMemPool() {
  const memDb = newDb();

  // Register uuid functions for PostgreSQL compatibility
  memDb.public.registerFunction({
    name: 'uuid_generate_v4',
    implementation: () => 'uuid-' + Math.random().toString(36).substring(2, 12),
  });

  const adapter = memDb.adapters.createPg();
  const pool = new adapter.Pool();

  return pool;
}

export async function getDbPool() {
  if (activePool && isInitialized) {
    return activePool;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('mock') && !databaseUrl.includes('localhost:5432/none')) {
    try {
      console.log('[Database] Attempting connection to PostgreSQL via DATABASE_URL...');
      const realPool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      await realPool.query('SELECT 1');
      console.log('[Database] Successfully connected to live PostgreSQL instance.');
      activePool = realPool;
      dbMode = 'live-postgres';
      isInitialized = true;
      return activePool;
    } catch (err: any) {
      console.warn(`[Database] Could not connect to DATABASE_URL (${err.message}). Falling back to embedded PostgreSQL engine (pg-mem) for hackathon demo.`);
    }
  }

  // Fallback / Default local engine
  console.log('[Database] Initializing embedded PostgreSQL engine (pg-mem) with standard PostgreSQL SQL dialect.');
  activePool = createPgMemPool();
  dbMode = 'in-memory-pg-compatible';

  // Automatically execute initial schema migrations
  await runSqlMigrationOnPool(activePool);
  // Run seed data
  await runSqlSeedOnPool(activePool);

  isInitialized = true;
  return activePool;
}

async function runSqlMigrationOnPool(pool: any) {
  try {
    const migrationPath = path.resolve(process.cwd(), 'backend/migrations/001_initial_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      console.log('[Database] Successfully applied 001_initial_schema.sql');
    }
  } catch (err: any) {
    console.error('[Database Migration Error]', err.message);
  }
}

async function runSqlSeedOnPool(pool: any) {
  try {
    const seedPath = path.resolve(process.cwd(), 'backend/seeds/seed.sql');
    if (fs.existsSync(seedPath)) {
      const sql = fs.readFileSync(seedPath, 'utf8');
      await pool.query(sql);
      console.log('[Database] Successfully applied development seed.sql');
    }
  } catch (err: any) {
    console.error('[Database Seed Error]', err.message);
  }
}

export async function getDbStatus(): Promise<IDatabaseStatus> {
  try {
    const pool = await getDbPool();
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = res.rows.map((r: any) => r.table_name || r.TABLE_NAME);
    return {
      connected: true,
      engine: 'PostgreSQL (pg pool driver)',
      mode: dbMode,
      tables,
    };
  } catch (err: any) {
    return {
      connected: false,
      engine: 'PostgreSQL',
      mode: dbMode,
      tables: [],
      error: err.message,
    };
  }
}
