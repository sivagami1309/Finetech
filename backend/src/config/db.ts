import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { newDb } from 'pg-mem';

const { Pool } = pg;

export interface IDatabaseStatus {
  connected: boolean;
  engine: string;
  mode: 'live-postgres' | 'in-memory-pg-compatible';
  database: string;
  tables: string[];
  userCount?: number;
  error?: string;
}

let activePool: {
  query: (text: string, params?: any[]) => Promise<any>;
  connect?: () => Promise<any>;
};

let dbMode: 'live-postgres' | 'in-memory-pg-compatible' = 'in-memory-pg-compatible';
let activeDatabaseName = 'finguard_trustflow';
let isInitialized = false;

// Initialize pg-mem in-memory postgres instance for zero-dependency local execution
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

  // Check for DATABASE_URL or individual parameters
  const databaseUrl = process.env.DATABASE_URL;
  const dbHost = process.env.DB_HOST || process.env.PGHOST;
  const dbUser = process.env.DB_USER || process.env.PGUSER;
  const dbPassword = process.env.DB_PASSWORD || process.env.PGPASSWORD;
  const dbName = process.env.DB_NAME || process.env.PGDATABASE || 'finguard_trustflow';
  const dbPort = parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10);

  activeDatabaseName = dbName;

  // Attempt live PostgreSQL connection if DATABASE_URL or host configuration is provided
  if (
    (databaseUrl && !databaseUrl.includes('mock') && !databaseUrl.includes('none')) ||
    (dbHost && dbHost !== 'none')
  ) {
    try {
      console.log(`[Database] Attempting connection to PostgreSQL database "${dbName}"...`);
      const isSslRequired =
        process.env.PGSSLMODE === 'require' ||
        process.env.DATABASE_SSL === 'true' ||
        (databaseUrl && databaseUrl.includes('sslmode=require')) ||
        process.env.NODE_ENV === 'production';

      const poolConfig: pg.PoolConfig = databaseUrl
        ? {
            connectionString: databaseUrl,
            ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
            connectionTimeoutMillis: 5000,
          }
        : {
            host: dbHost,
            port: dbPort,
            database: dbName,
            user: dbUser,
            password: dbPassword,
            ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
            connectionTimeoutMillis: 5000,
          };

      const realPool = new Pool(poolConfig);

      // Verify connection with a ping query
      await realPool.query('SELECT 1');
      console.log(`[Database] Successfully connected to PostgreSQL database: ${dbName}`);
      activePool = realPool;
      dbMode = 'live-postgres';
      isInitialized = true;
      return activePool;
    } catch (err: any) {
      console.warn(
        `[Database] Could not connect to PostgreSQL server (${err.message}). ` +
        `Using embedded PostgreSQL pool configured with database "${dbName}" and table "public.users".`
      );
    }
  }

  // Fallback embedded PostgreSQL engine for zero-dependency local runs
  console.log(`[Database] Initializing embedded PostgreSQL pool for database "${dbName}" with public.users table.`);
  activePool = createPgMemPool();
  dbMode = 'in-memory-pg-compatible';

  // Apply schema migrations and development seed
  await runSqlMigrationOnPool(activePool);
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
      console.log('[Database] Applied schema migration to public.users');
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
      console.log('[Database] Seeded initial demo user into public.users');
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

    // Get count of registered users in public.users
    let userCount = 0;
    try {
      const countRes = await pool.query('SELECT COUNT(*) as count FROM public.users');
      userCount = parseInt(countRes.rows[0]?.count || '0', 10);
    } catch {
      // Table might not be queried yet
    }

    return {
      connected: true,
      engine: 'PostgreSQL (pg pool driver)',
      mode: dbMode,
      database: activeDatabaseName,
      tables,
      userCount,
    };
  } catch (err: any) {
    return {
      connected: false,
      engine: 'PostgreSQL',
      mode: dbMode,
      database: activeDatabaseName,
      tables: [],
      error: err.message,
    };
  }
}
