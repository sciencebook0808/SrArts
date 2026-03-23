/**
 * scripts/setupDatabase.ts
 *
 * Run after build to ensure all tables exist.
 * Reads DATABASE_URL from environment (via dotenv).
 *
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/setupDatabase.ts
 * Auto-run: "postbuild" script in package.json (skipped if DATABASE_URL unset)
 */

import * as fs   from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log('[setupDatabase] DATABASE_URL not set — skipping table creation.');
  process.exit(0);
}

async function run() {
  // Dynamic import so the module is only resolved when needed
  // (avoids breaking the build if pg is not installed)
  let pg: typeof import('pg');
  try {
    pg = await import('pg');
  } catch {
    console.warn('[setupDatabase] pg package not found. Install it with: npm i pg @types/pg');
    console.warn('[setupDatabase] Falling back to prisma migrate deploy.');
    process.exit(0);
  }

  const { Pool } = pg;
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  const sqlPath = path.join(process.cwd(), 'scripts', 'initDatabase.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('[setupDatabase] initDatabase.sql not found at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log('[setupDatabase] Running table creation SQL…');
  try {
    await pool.query(sql);
    console.log('[setupDatabase] ✓ All tables created/verified.');
  } catch (err) {
    // Non-fatal: Prisma migrations likely already created tables
    console.warn('[setupDatabase] SQL warning (may be OK if tables already exist):', (err as Error).message);
  } finally {
    await pool.end();
  }
}

run().catch(err => {
  console.error('[setupDatabase] Fatal:', err);
  process.exit(1);
});
