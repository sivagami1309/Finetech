import fs from 'fs';
import path from 'path';
import { getDbPool, getDbStatus } from '../config/db';

async function runSeed() {
  console.log('==================================================');
  console.log('Seeding FinGuard – TrustFlow Development Database');
  console.log('==================================================');

  try {
    const status = await getDbStatus();
    console.log(`[Database Engine]: ${status.engine} (${status.mode})`);

    const pool = await getDbPool();

    if (process.env.DATABASE_URL) {
      const seedFile = path.resolve(process.cwd(), 'backend/seeds/seed.sql');
      const sql = fs.readFileSync(seedFile, 'utf8');
      console.log(`Executing seed script on live PostgreSQL...`);
      await pool.query(sql);
    }

    const checkUser = await pool.query("SELECT id, name, email, role FROM users WHERE email = 'arjun.mehta@freelance.dev'");
    if (checkUser.rows.length > 0) {
      console.log(`✓ Verified demo user seeded: ${checkUser.rows[0].name} (${checkUser.rows[0].email})`);
    }

    const checkTx = await pool.query('SELECT reference_code, source_amount, destination_amount, status FROM transactions LIMIT 1');
    if (checkTx.rows.length > 0) {
      console.log(`✓ Verified demo transaction: ${checkTx.rows[0].reference_code} ($${checkTx.rows[0].source_amount} -> ₹${checkTx.rows[0].destination_amount}) [${checkTx.rows[0].status}]`);
    }

    console.log('Development database seeded and verified successfully.');
    process.exit(0);
  } catch (err: any) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

runSeed();
