'use server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export async function hashPassword(p: string) { return crypto.createHash('sha256').update(p).digest('hex'); }
export async function verifyAdminPassword(p: string) {
  if (!ADMIN_PASSWORD) return false;
  return (await hashPassword(p)) === (await hashPassword(ADMIN_PASSWORD));
}
export async function setAdminSession() {
  (await cookies()).set('admin_session', crypto.randomBytes(32).toString('hex'), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 86400, path: '/admin' });
}
export async function getAdminSession() { return (await cookies()).get('admin_session')?.value; }
export async function clearAdminSession() { (await cookies()).delete('admin_session'); }
export async function isAdminLoggedIn() { return !!(await getAdminSession()); }
