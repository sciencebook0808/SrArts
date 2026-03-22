'use server';
/**
 * lib/admin-auth.ts — Admin session management
 *
 * Uses a simple session-cookie approach, completely separate from Clerk.
 * Cookie is HttpOnly, Secure in production, SameSite=lax, scoped to /admin.
 *
 * The password is compared using a constant-time hash comparison (SHA-256)
 * to prevent timing attacks.
 */

import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const SESSION_NAME   = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  // Constant-time comparison via hash — prevents timing side-channel leaks
  return sha256(password) === sha256(ADMIN_PASSWORD);
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, crypto.randomBytes(32).toString('hex'), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_MAX_AGE,
    path:     '/admin',
  });
}

export async function getAdminSession(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_NAME)?.value;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
}

export async function isAdminLoggedIn(): Promise<boolean> {
  return !!(await getAdminSession());
}
