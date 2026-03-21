'use server';

/**
 * lib/admin-auth.ts
 *
 * Next.js 16: cookies() is ASYNC — must always be `await cookies()`.
 * Synchronous access was removed in v16 (was deprecated in v15).
 */
import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  const inputHash = await hashPassword(password);
  const adminHash = await hashPassword(ADMIN_PASSWORD);
  return inputHash === adminHash;
}

export async function setAdminSession(): Promise<void> {
  // Next.js 16: await cookies() — synchronous access removed
  const cookieStore = await cookies();
  const sessionId = crypto.randomBytes(32).toString('hex');

  cookieStore.set('admin_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/admin',
  });
}

export async function getAdminSession(): Promise<string | undefined> {
  // Next.js 16: await cookies()
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value;
}

export async function clearAdminSession(): Promise<void> {
  // Next.js 16: await cookies()
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const session = await getAdminSession();
  return !!session;
}
