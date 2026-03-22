/**
 * lib/db.ts — Prisma 7 client singleton for Next.js
 *
 * ── Verified against prisma.io/docs (March 2026) ─────────────────────────────
 *
 * Prisma 7 REQUIRES an adapter — PrismaClient({ adapter }) is mandatory.
 * CockroachDB uses @prisma/adapter-pg (PostgreSQL wire protocol, port 26257).
 *
 * Singleton pattern prevents multiple PrismaClient instances during
 * Next.js hot-reload in development (each reload would otherwise open
 * a new connection pool, exhausting CockroachDB connection limits).
 *
 * @prisma/adapter-pg bundles its own pg types since 7.5.0 —
 * no separate @types/pg installation is needed.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Extend globalThis to cache the prisma instance across hot-reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
      'Add it to .env.local:\n' +
      '  DATABASE_URL="postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full"'
    );
  }

  // PrismaPg adapter connects to CockroachDB via PostgreSQL wire protocol
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createClient();

// Persist the client across hot-reloads in development only
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
