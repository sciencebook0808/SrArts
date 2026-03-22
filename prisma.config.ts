/**
 * prisma.config.ts — Prisma 7 CLI configuration
 *
 * VERIFIED (March 2026 — prisma.io/docs/orm/reference/prisma-config-reference):
 *  ✓ DATABASE_URL goes HERE, not in schema.prisma
 *  ✓ `engine: "classic"` needed for CockroachDB (JS engine lacks full DDL support)
 *  ✓ dotenv/config loads .env.local in CLI context
 *  ✓ Prisma 7.2+ allows `prisma generate` with undefined DATABASE_URL (build-time safe)
 *
 * CLI operations (migrate, db push) still need DATABASE_URL set.
 * Runtime (Next.js): Next.js loads env vars itself — this file is CLI-only.
 */
import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  migrations: {
    path: path.join('prisma', 'migrations'),
  },

  // CockroachDB: postgresql:// protocol, port 26257
  // Format: postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full
  datasource: {
    url: env('DATABASE_URL'),
  },
});
