/**
 * lib/db.ts  —  Prisma 7 client singleton for Next.js
 *
 * PRISMA 7 BREAKING CHANGE:
 * PrismaClient({ adapter }) is now REQUIRED for all databases.
 * You cannot instantiate PrismaClient without an adapter or accelerateUrl.
 *
 * CockroachDB uses @prisma/adapter-pg (PostgreSQL wire protocol).
 *
 * Singleton pattern prevents multiple PrismaClient instances during
 * Next.js hot-reload in development (each reload would otherwise open
 * a new connection pool, exhausting CockroachDB's connection limit).
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Add it to .env.local (format: postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full)'
    );
  }

  // PrismaPg connects to CockroachDB using the PostgreSQL wire protocol.
  // @types/pg is bundled with @prisma/adapter-pg since 7.5.0 — no separate install needed.
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
