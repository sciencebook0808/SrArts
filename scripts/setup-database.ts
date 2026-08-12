/**
 * scripts/setup-database.ts — applies pending migrations during the build.
 *
 * Runs as part of `npm run build` (see package.json) so a deploy brings the
 * database up to date before Next.js starts prerendering pages.
 *
 * WHY THIS CHANGED
 *  This script used to run `prisma db push`, which pushes the schema WITHOUT
 *  recording anything in `_prisma_migrations`. Now that the project has a real
 *  migration history (prisma/migrations/), mixing the two is actively harmful:
 *  `db push` silently diverges the database from the recorded history, and the
 *  next `migrate deploy` then fails with a drift error.
 *
 *  It also defaulted to offering `FORCE_RESET=true`, which runs
 *  `db push --force-reset` — that DROPS THE ENTIRE DATABASE. Having a
 *  data-destroying switch wired into an automatic build pipeline pointed at a
 *  production database is not a safe default, so it is gone.
 *
 *  `prisma migrate deploy` is the supported production command: it only applies
 *  migrations that have not been applied yet, never resets, and never destroys
 *  data on its own.
 *
 * ENV
 *  DATABASE_URL         — required (pooled connection is fine for the app;
 *                         prisma.config.ts derives the direct URL for migrating)
 *  DIRECT_DATABASE_URL  — optional explicit unpooled URL (recommended on Neon)
 *  SKIP_DB_MIGRATE=true — skip this step entirely and manage schema manually
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'node:path';

// Match prisma.config.ts: read local env files so the script behaves the same
// when run by hand as it does on Vercel (where the vars are already exported).
// Real environment variables always win — dotenv does not override by default.
for (const file of ['.env.local', '.env']) {
  dotenv.config({ path: path.resolve(process.cwd(), file) });
}

const DATABASE_URL =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function deployMigrations(attempt: number): boolean {
  console.log(`[setup-database] prisma migrate deploy — attempt ${attempt}/${MAX_RETRIES}`);
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL },
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Back-compat: honour the old SKIP_DB_PUSH name too.
  if (process.env.SKIP_DB_MIGRATE === 'true' || process.env.SKIP_DB_PUSH === 'true') {
    console.log('[setup-database] SKIP_DB_MIGRATE=true — skipping migrations.');
    process.exit(0);
  }

  console.log('[setup-database] Applying pending database migrations...');

  if (!DATABASE_URL) {
    console.error(
      '[setup-database] ❌ No database URL found.\n' +
      '  Set DATABASE_URL (or POSTGRES_URL / POSTGRES_PRISMA_URL) in your environment.\n' +
      '  To skip this step set SKIP_DB_MIGRATE=true.'
    );
    process.exit(1);
  }

  const maskedUrl = DATABASE_URL.replace(/:([^@]+)@/, ':****@');
  console.log(`[setup-database] Using DB: ${maskedUrl}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (deployMigrations(attempt)) {
      console.log('[setup-database] ✅ Migrations applied.');
      process.exit(0);
    }
    if (attempt < MAX_RETRIES) {
      console.log(
        `[setup-database] ⚠️  Attempt ${attempt} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`
      );
      await sleep(RETRY_DELAY_MS);
    }
  }

  console.error(
    `[setup-database] ❌ Migration failed after ${MAX_RETRIES} attempts.\n` +
    '  Common causes:\n' +
    '    • DATABASE_URL points at a pooled endpoint and no direct URL is available.\n' +
    '      → Set DIRECT_DATABASE_URL to the unpooled connection string.\n' +
    '    • Schema drift: the database was previously modified with `prisma db push`.\n' +
    '      → Run `npx prisma migrate status` locally to inspect.\n' +
    '    • Set SKIP_DB_MIGRATE=true to deploy without touching the schema.'
  );
  process.exit(1);
}

void main();
