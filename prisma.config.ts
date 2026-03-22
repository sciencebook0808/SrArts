/**
 * prisma.config.ts  —  Root of project, next to package.json
 *
 * PRISMA 7 MANDATORY:
 * - DATABASE_URL must be here, NOT in schema.prisma datasource block
 * - `datasource` property is required for all CLI operations (migrate, push, studio)
 * - engine: "classic" uses the Rust-based schema engine for migrations (still needed
 *   for CockroachDB in Prisma 7 — the new JS engine does not yet support all DDL)
 *
 * dotenv/config loads .env.local and .env automatically on the CLI side.
 * At runtime (Next.js) Next.js loads env vars itself, so this file is CLI-only.
 */
import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  migrations: {
    path: path.join('prisma', 'migrations'),
  },

  // DATABASE_URL is the CockroachDB connection string.
  // Format: postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full
  // (Prisma uses postgresql:// protocol even with cockroachdb provider)
  datasource: {
    url: env('DATABASE_URL'),
  },
});
