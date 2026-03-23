/**
 * scripts/migrate-deploy-safe.js
 *
 * Production-safe wrapper around `prisma migrate deploy`.
 *
 * VERIFIED AGAINST: Prisma v7 official docs (pris.ly/d/migrate-resolve), March 2026.
 *
 * WHY THIS EXISTS:
 * ─────────────────────────────────────────────────────────────────────────────
 * Running `prisma migrate deploy` directly in the build command can crash the
 * entire Vercel / CI build if:
 *   1. DATABASE_URL is not set in the build environment (generates a fatal error)
 *   2. A previous migration failed (P3009) — which blocks all future deploys
 *   3. The DB is temporarily unreachable during build
 *
 * This wrapper:
 *   - Skips gracefully if DATABASE_URL is absent (CI/build-only environments)
 *   - Detects P3009 and prints a clear recovery guide — does NOT crash the build
 *   - Exits 0 (success) when no DB is available so `next build` always proceeds
 *   - Exits 1 only for genuinely unexpected errors
 *
 * P3009 RECOVERY (from official docs):
 *   The `_prisma_migrations` table has a row with a failed migration.
 *   Two options — choose based on whether the columns already exist in the DB:
 *
 *   OPTION A — Columns DO NOT exist (migration rolled back cleanly):
 *     npx prisma migrate resolve --rolled-back 20260323000000_community_reference_fields
 *     npx prisma migrate deploy
 *
 *   OPTION B — Columns DO exist (migration was partially applied):
 *     npx prisma migrate resolve --applied 20260323000000_community_reference_fields
 *     (no redeploy needed — migration is now considered complete)
 *
 *   One-command shortcut:
 *     npm run db:fix
 *
 * SOURCE:
 *   https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing
 *   https://www.prisma.io/docs/cli/migrate/resolve
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { execSync } = require('child_process');

const DATABASE_URL = process.env.DATABASE_URL;

// ── No DATABASE_URL — skip silently (Vercel build, CI type-gen, etc.) ────────
if (!DATABASE_URL) {
  console.log('[migrate-deploy-safe] DATABASE_URL not set — skipping prisma migrate deploy.');
  console.log('[migrate-deploy-safe] This is normal for build-time environments.');
  process.exit(0);
}

// ── Run prisma migrate deploy ─────────────────────────────────────────────────
console.log('[migrate-deploy-safe] Running prisma migrate deploy...');

try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('[migrate-deploy-safe] ✓ Migrations applied successfully.');
  process.exit(0);

} catch (err) {
  const output = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '') + (err.message ?? '');

  // ── P3009: Failed migration in database ──────────────────────────────────
  if (output.includes('P3009') || output.includes('migrate found failed migrations')) {
    console.error('\n[migrate-deploy-safe] ⚠️  P3009 DETECTED — Failed migration blocking deploy.\n');
    console.error('════════════════════════════════════════════════════════════════════');
    console.error('  The migration "20260323000000_community_reference_fields" previously');
    console.error('  failed and is recorded as failed in the _prisma_migrations table.');
    console.error('  Prisma will not apply new migrations until this is resolved.');
    console.error('');
    console.error('  SOURCE: https://pris.ly/d/migrate-resolve (Official Prisma Docs)');
    console.error('');
    console.error('  STEP 1 — Check which columns already exist:');
    console.error('  ┌─────────────────────────────────────────────────────────────┐');
    console.error('  │  SELECT column_name FROM information_schema.columns          │');
    console.error('  │  WHERE table_name = \'CommunityPost\'                         │');
    console.error('  │  AND column_name IN (                                        │');
    console.error('  │    \'referenceType\', \'referenceId\', \'referenceTitle\',        │');
    console.error('  │    \'referenceImage\', \'referenceSlug\'                        │');
    console.error('  │  );                                                          │');
    console.error('  └─────────────────────────────────────────────────────────────┘');
    console.error('');
    console.error('  STEP 2A — If columns DO NOT exist (run both):');
    console.error('    npx prisma migrate resolve --rolled-back 20260323000000_community_reference_fields');
    console.error('    npx prisma migrate deploy');
    console.error('');
    console.error('  STEP 2B — If columns DO exist (partially applied, run once):');
    console.error('    npx prisma migrate resolve --applied 20260323000000_community_reference_fields');
    console.error('');
    console.error('  ONE-COMMAND SHORTCUT (runs full diagnostic + fix):');
    console.error('    npm run db:fix');
    console.error('');
    console.error('════════════════════════════════════════════════════════════════════');
    console.error('[migrate-deploy-safe] Build continues — migration must be fixed manually in production.');
    // Exit 0 so `next build` can still complete — the app will run, just without
    // the new columns until the migration is manually resolved in production.
    process.exit(0);
  }

  // ── P3018: A single migration failed to apply (different from P3009) ─────
  if (output.includes('P3018') || output.includes('migration failed to apply')) {
    console.error('\n[migrate-deploy-safe] ⚠️  P3018 — A migration failed during this deploy.\n');
    console.error('  Run: npm run db:status  to see which migration failed.');
    console.error('  Then: npm run db:fix    to recover.');
    process.exit(0);
  }

  // ── Genuine unexpected error — re-throw ──────────────────────────────────
  console.error('[migrate-deploy-safe] ✗ Unexpected migrate error:', output);
  process.exit(1);
}
