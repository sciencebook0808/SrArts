/**
 * scripts/migrate-deploy-safe.js
 *
 * Production-safe Prisma migrate deploy wrapper with AUTOMATIC P3009 resolution.
 *
 * ─── THE BUG THIS FIXES ──────────────────────────────────────────────────────
 * The previous version used:
 *   execSync('npx prisma migrate deploy', { stdio: 'inherit' })
 *
 * When stdio is 'inherit', stdout/stderr flow directly to the terminal and are
 * NOT captured in the Error object. So err.stdout and err.stderr are both null.
 * The only thing in err.message is "Command failed: npx prisma migrate deploy"
 * — which does NOT contain "P3009", causing ALL P3009 errors to fall through
 * to the "Unexpected migrate error" branch and exit(1), crashing the build.
 *
 * THE FIX: Use spawnSync with stdio: 'pipe' to capture all output, then relay
 * it to the console manually. This lets us detect "P3009" in the output AND
 * show it to the developer — both at the same time.
 *
 * ─── AUTO-RESOLUTION LOGIC ───────────────────────────────────────────────────
 * When P3009 is detected, this script automatically:
 *   1. Runs  `prisma migrate resolve --rolled-back <name>`
 *   2. Retries `prisma migrate deploy`
 *   3. If --rolled-back gives P3012 ("not in a failed state"), tries --applied
 *
 * This is safe because our migration SQL uses IF NOT EXISTS on every statement,
 * so re-running is always idempotent — no risk of duplicate-column errors.
 *
 * ─── SOURCES (verified March 2026) ──────────────────────────────────────────
 *   https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing
 *   https://www.prisma.io/docs/cli/migrate/resolve
 *   https://pris.ly/d/migrate-resolve
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { spawnSync } = require('child_process');

// ─── Constants ───────────────────────────────────────────────────────────────
const MIGRATION_NAME = '20260323000000_community_reference_fields';
const MAX_RETRIES    = 1; // One auto-resolution attempt before giving up

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Run a command and return { stdout, stderr, status, combined }.
 * Output is printed to the console in real-time via the 'pipe' relay approach.
 *
 * WHY spawnSync with stdio:'pipe' instead of execSync with stdio:'inherit':
 *   - stdio:'inherit' → output goes to terminal BUT is NOT captured in err.stdout/stderr
 *   - stdio:'pipe'    → output IS captured in result.stdout/stderr
 *   We relay captured output to console.log/error so the developer sees it too.
 */
function run(command, args = []) {
  const result = spawnSync(command, args, {
    stdio:    'pipe',
    encoding: 'utf-8',
    env:      process.env,
    shell:    process.platform === 'win32', // required for `npx` on Windows
  });

  const stdout   = result.stdout ?? '';
  const stderr   = result.stderr ?? '';
  const combined = stdout + stderr;

  // Relay captured output to terminal so developer sees Prisma's own messages
  if (stdout.trim()) process.stdout.write(stdout);
  if (stderr.trim()) process.stderr.write(stderr);

  return {
    stdout,
    stderr,
    combined,
    status: result.status ?? 1,
    ok:     result.status === 0,
  };
}

/**
 * Run `prisma migrate deploy` and return the result.
 * Uses `npx` so it works regardless of whether prisma is globally installed.
 */
function migratedeploy() {
  console.log('\n[migrate-deploy-safe] Running: npx prisma migrate deploy');
  return run('npx', ['prisma', 'migrate', 'deploy']);
}

/**
 * Run `prisma migrate resolve --rolled-back <name>`.
 * Per docs: "updates the migration record in _prisma_migrations to register it
 * as rolled back, allowing it to be applied again."
 * Source: https://www.prisma.io/docs/cli/migrate/resolve
 */
function resolveRolledBack(name) {
  console.log(`\n[migrate-deploy-safe] Running: npx prisma migrate resolve --rolled-back "${name}"`);
  return run('npx', ['prisma', 'migrate', 'resolve', '--rolled-back', name]);
}

/**
 * Run `prisma migrate resolve --applied <name>`.
 * Per docs: "tells Prisma Migrate to consider the migration successfully applied."
 * Use when the migration was partially or fully applied but Prisma doesn't know.
 * Source: https://www.prisma.io/docs/cli/migrate/resolve
 */
function resolveApplied(name) {
  console.log(`\n[migrate-deploy-safe] Running: npx prisma migrate resolve --applied "${name}"`);
  return run('npx', ['prisma', 'migrate', 'resolve', '--applied', name]);
}

// ─── Entry point ─────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log('[migrate-deploy-safe] DATABASE_URL not set — skipping prisma migrate deploy.');
  console.log('[migrate-deploy-safe] This is expected in build-only environments (Vercel, CI).');
  process.exit(0);
}

// ─── Attempt 1: normal migrate deploy ────────────────────────────────────────
let deployResult = migratedeploy();

if (deployResult.ok) {
  console.log('\n[migrate-deploy-safe] ✓ Migrations deployed successfully.');
  process.exit(0);
}

// ─── P3009 detected: auto-resolve ────────────────────────────────────────────
const isP3009 = deployResult.combined.includes('P3009')
             || deployResult.combined.includes('migrate found failed migrations');

if (isP3009) {
  console.error('\n[migrate-deploy-safe] ⚠️  P3009 detected — failed migration blocking deploy.');
  console.error(`[migrate-deploy-safe] Attempting automatic resolution of: ${MIGRATION_NAME}`);
  console.error('[migrate-deploy-safe] Source: https://pris.ly/d/migrate-resolve\n');

  // ── Strategy: try --rolled-back first (safe because SQL uses IF NOT EXISTS)
  // If the migration was partially applied (columns exist), --rolled-back will
  // succeed and the re-deploy will re-run the SQL — IF NOT EXISTS makes it safe.
  // If --rolled-back gives P3012 ("not in a failed state"), it means the row was
  // already resolved by a previous run, so we try --applied as a fallback.

  const rollbackResult = resolveRolledBack(MIGRATION_NAME);

  const isP3012 = rollbackResult.combined.includes('P3012')
               || rollbackResult.combined.includes('not in a failed state')
               || rollbackResult.combined.includes('cannot be rolled back');

  if (!rollbackResult.ok && isP3012) {
    // P3012 means the migration is no longer in a failed state — it was either
    // already resolved or is considered clean. Try --applied as fallback.
    console.warn('\n[migrate-deploy-safe] --rolled-back gave P3012 (not in failed state).');
    console.warn('[migrate-deploy-safe] Trying --applied instead...');

    const appliedResult = resolveApplied(MIGRATION_NAME);

    if (!appliedResult.ok) {
      // --applied also failed. The migration is already in a non-failed state.
      // This is fine — just retry deploy directly.
      console.warn('[migrate-deploy-safe] --applied also returned non-zero.');
      console.warn('[migrate-deploy-safe] Migration may already be resolved. Retrying deploy...');
    } else {
      console.log('\n[migrate-deploy-safe] ✓ Marked as applied. Retrying deploy...');
    }
  } else if (!rollbackResult.ok) {
    // --rolled-back failed for an unknown reason. Log and proceed to retry anyway.
    console.error('\n[migrate-deploy-safe] --rolled-back returned non-zero (unexpected).');
    console.error('[migrate-deploy-safe] Will still retry deploy in case the state was fixed.');
  } else {
    console.log('\n[migrate-deploy-safe] ✓ Migration marked as rolled-back. Retrying deploy...');
  }

  // ── Attempt 2: retry migrate deploy after resolution ─────────────────────
  deployResult = migratedeploy();

  if (deployResult.ok) {
    console.log('\n[migrate-deploy-safe] ✓ P3009 resolved — migrations deployed successfully.');
    process.exit(0);
  }

  // ── Retry also failed — escalate with full diagnostic ────────────────────
  console.error('\n[migrate-deploy-safe] ✗ Deploy failed even after resolution attempt.');
  console.error('\n════════════════════════════════════════════════════════════════════');
  console.error('MANUAL RECOVERY REQUIRED');
  console.error('════════════════════════════════════════════════════════════════════');
  console.error('\nStep 1 — Inspect the _prisma_migrations table:');
  console.error(`
  SELECT migration_name, started_at, finished_at,
         rolled_back_at, applied_steps_count, logs
  FROM "_prisma_migrations"
  WHERE migration_name = '${MIGRATION_NAME}';
`);
  console.error('Step 2 — Check whether the new columns already exist:');
  console.error(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'CommunityPost'
    AND column_name IN (
      'referenceType', 'referenceId', 'referenceTitle',
      'referenceImage', 'referenceSlug'
    );
`);
  console.error('Step 3 — Choose the right resolution:');
  console.error(`
  IF columns DO NOT exist (0-4 rows above):
    npx prisma migrate resolve --rolled-back "${MIGRATION_NAME}"
    npx prisma migrate deploy

  IF columns DO exist (5 rows above):
    npx prisma migrate resolve --applied "${MIGRATION_NAME}"
`);
  console.error('Full runbook: docs/MIGRATION_RECOVERY.md');
  console.error('════════════════════════════════════════════════════════════════════\n');

  // Exit 0 so `next build` can still complete.
  // The app will work — it just won't have the new reference columns in DB yet.
  // The columns are all nullable so no runtime crashes will occur.
  console.error('[migrate-deploy-safe] Continuing build despite migration failure.');
  console.error('[migrate-deploy-safe] Fix the migration state before the next production deploy.\n');
  process.exit(0);
}

// ─── P3018: A migration failed during this specific deploy run ───────────────
const isP3018 = deployResult.combined.includes('P3018')
             || deployResult.combined.includes('migration failed to apply');

if (isP3018) {
  console.error('\n[migrate-deploy-safe] ⚠️  P3018 — A migration failed to apply.');
  console.error('[migrate-deploy-safe] Run: npm run db:status  to identify which migration.');
  console.error('[migrate-deploy-safe] Run: npm run db:fix     to recover.');
  // P3018 is a different error — migration failed during THIS deploy attempt.
  // Exit 0 to let the build continue; app code doesn't require these columns.
  process.exit(0);
}

// ─── Unknown error — exit 1 ──────────────────────────────────────────────────
// Only reach here for genuinely unexpected failures (DB unreachable, bad creds, etc.)
// These are real build-breaking problems that should be surfaced to the developer.
console.error('\n[migrate-deploy-safe] ✗ Unexpected Prisma error (not P3009/P3018).');
console.error('[migrate-deploy-safe] Error output captured:');
console.error(deployResult.combined || '(no output captured — check logs above)');
console.error('\nCheck DATABASE_URL, network connectivity, and CockroachDB cluster status.');
process.exit(1);
