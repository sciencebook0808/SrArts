'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  const hash = await hashPassword(password);
  const adminHash = await hashPassword(ADMIN_PASSWORD);
  return hash === adminHash;
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const sessionId = crypto.randomBytes(32).toString('hex');
  
  cookieStore.set('admin_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/admin',
  });

  return sessionId;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const session = await getAdminSession();
  return !!session;
}
