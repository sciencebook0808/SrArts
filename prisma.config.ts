/**
 * prisma.config.ts — Prisma 7 CLI configuration
 *
 * Verified against prisma.io/docs/orm/reference/prisma-config-reference (March 2026)
 *
 * KEY RULES:
 *  ✓ DATABASE_URL goes here, NOT in schema.prisma
 *  ✓ schema.datasource has NO `url` field (causes P1012 if present)
 *  ✓ `engine: { type: "client" }` is the default for Prisma 7 GA
 *  ✓ dotenv/config loads .env.local for CLI operations
 *
 * DATABASE_URL SAFETY:
 *  `prisma generate` does NOT need a database connection — it only reads the
 *  schema to generate TypeScript types. We therefore make DATABASE_URL optional
 *  here with a fallback empty string so `prisma generate` succeeds during CI/CD
 *  builds where DATABASE_URL is not available in the build environment.
 *
 *  `prisma migrate deploy` DOES need DATABASE_URL — it will fail fast with a
 *  clear error message if the env var is missing, which is the correct behaviour.
 *
 * RUNTIME (Next.js):
 *  Next.js loads env vars automatically — this file is CLI-only.
 *  The runtime PrismaClient in lib/db.ts uses process.env.DATABASE_URL directly.
 */

import dotenv from 'dotenv';
import path   from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Load local env files for CLI use.
 *
 * BUG FIX: this file used to `import 'dotenv/config'`, which only reads `.env`.
 * The project keeps its credentials in `.env.local` (the Next.js convention),
 * so every Prisma CLI command that needs a connection — `migrate deploy`,
 * `migrate status`, `db push`, `studio` — failed with
 * "Connection url is empty" even though the app itself ran fine (Next.js loads
 * `.env.local` natively).
 *
 * `override: false` is the default, so real environment variables (Vercel,
 * CI) always win over anything on disk.
 */
for (const file of ['.env.local', '.env']) {
  dotenv.config({ path: path.resolve(process.cwd(), file) });
}

/**
 * Migration connection string.
 *
 * The runtime uses Neon's **pooled** endpoint (`...-pooler.<region>.neon.tech`),
 * which is PgBouncer in transaction mode. That is right for serverless request
 * handling, but it cannot serve Prisma Migrate: migrations need session-level
 * state (advisory locks used to serialise concurrent deploys, plus multi-
 * statement DDL transactions), and PgBouncer transaction pooling silently drops
 * both. Symptoms are a migrate command that hangs or reports a lost lock.
 *
 * Resolution order:
 *   1. DIRECT_DATABASE_URL — set this explicitly if your provider gives you a
 *      separate direct/unpooled URL (recommended).
 *   2. DATABASE_URL with Neon's `-pooler` suffix stripped from the host, which
 *      is exactly how Neon names the matching direct endpoint.
 *   3. DATABASE_URL unchanged (non-Neon setups, or a URL that is already direct).
 */
function migrationUrl(): string {
  const direct = process.env.DIRECT_DATABASE_URL?.trim();
  if (direct) return direct;

  const pooled = process.env.DATABASE_URL?.trim();
  if (!pooled) return '';

  try {
    const u = new URL(pooled);
    if (u.hostname.includes('-pooler.')) {
      u.hostname = u.hostname.replace('-pooler.', '.');
      return u.toString();
    }
  } catch {
    // Not a parseable URL — hand it back untouched and let Prisma report it.
  }
  return pooled;
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  migrations: {
    path: path.join('prisma', 'migrations'),
  },

  datasource: {
    // Use process.env directly (not env()) so prisma generate doesn't throw
    // when DATABASE_URL is absent during build-time type generation.
    // prisma migrate deploy will still fail fast with a clear error if unset.
    url: migrationUrl(),
  },
});
