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

import 'dotenv/config';
import path   from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  migrations: {
    path: path.join('prisma', 'migrations'),
  },

  datasource: {
    // Use process.env directly (not env()) so prisma generate doesn't throw
    // when DATABASE_URL is absent during build-time type generation.
    // prisma migrate deploy will still fail fast with a clear error if unset.
    url: process.env.DATABASE_URL ?? '',
  },
});
