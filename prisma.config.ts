/**
 * prisma.config.ts — Prisma 7 CLI configuration
 *
 * ── Verified against prisma.io/docs/orm/reference/prisma-config-reference (March 2026) ──
 *
 * KEY RULES:
 *  ✓ DATABASE_URL goes here, NOT in schema.prisma
 *  ✓ schema.datasource has NO `url` field (causes P1012 if present)
 *  ✓ `engine: { type: "client" }` is the default for Prisma 7 GA
 *  ✓ dotenv/config loads .env.local for CLI operations
 *  ✓ prisma generate works without DATABASE_URL (build-time safe)
 *  ✓ prisma db push / migrate dev need DATABASE_URL set
 *
 * RUNTIME (Next.js):
 *  Next.js loads env vars automatically — this file is CLI-only.
 *  The runtime PrismaClient in lib/db.ts uses process.env.DATABASE_URL directly.
 */

import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  migrations: {
    path: path.join('prisma', 'migrations'),
  },

  datasource: {
    // CockroachDB Serverless connection string format:
    // postgresql://[user]:[password]@[host]:26257/[db]?sslmode=verify-full
    url: env('DATABASE_URL'),
  },
});
