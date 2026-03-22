'use server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

function hash(p: string) {
  return crypto.createHash('sha256').update(p).digest('hex');
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  return hash(password) === hash(ADMIN_PASSWORD);
}

export async function setAdminSession(): Promise<void> {
  const store = await cookies();
  store.set('admin_session', crypto.randomBytes(32).toString('hex'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/admin',
  });
}

export async function getAdminSession(): Promise<string | undefined> {
  const store = await cookies();
  return store.get('admin_session')?.value;
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete('admin_session');
}

export async function isAdminLoggedIn(): Promise<boolean> {
  return !!(await getAdminSession());
}
