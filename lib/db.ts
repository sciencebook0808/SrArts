/**
 * lib/db.ts — Prisma 7 client singleton for Next.js
 *
 * Prisma 7 requires an adapter — PrismaClient({ adapter }) is mandatory.
 * CockroachDB uses @prisma/adapter-pg (PostgreSQL wire protocol, port 26257).
 *
 * SINGLETON PATTERN:
 *  Prevents multiple PrismaClient instances during Next.js hot-reload in
 *  development. Each reload would otherwise open a new connection pool,
 *  quickly exhausting CockroachDB's connection limits.
 *
 * PRODUCTION:
 *  In production each serverless invocation gets one PrismaClient instance.
 *  The global cache is irrelevant in production but kept for safety.
 *
 * @prisma/adapter-pg bundles its own pg types since 7.5.0 —
 * no separate @types/pg is needed.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg }     from '@prisma/adapter-pg';

// ─── Global cache key (survives hot-reload in dev) ────────────────────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ─── Factory ─────────────────────────────────────────────────────────────────

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      '[SR Arts] DATABASE_URL is not set.\n' +
      'Add it to .env.local:\n' +
      '  DATABASE_URL="postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full"\n' +
      'Get it from: https://cockroachlabs.cloud → Your cluster → Connection string'
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
    errorFormat: 'minimal',
  });
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
