/**
 * app/admin/layout.tsx — Admin area auth guard (Clerk roles only)
 *
 * v12: Removed all cookie/password/email-based logic.
 *      Uses ONLY Clerk publicMetadata.role.
 *
 * Flow:
 *  1. proxy.ts (middleware) handles routing redirects first
 *  2. This layout is a final server-side safety net
 *
 * Redirect targets:
 *  - Not signed in      → /sign-in?redirect_url=...
 *  - Signed in, no role → /admin/access-denied
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

interface Props { children: React.ReactNode }

const ADMIN_ROLES = ['admin', 'superadmin'] as const;

export default async function AdminLayout({ children }: Props) {
  const { userId, sessionClaims } = await auth();

  // Not authenticated
  if (!userId) {
    redirect('/sign-in?redirect_url=/admin/dashboard');
  }

  // Check role from Clerk publicMetadata
  const meta = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const role = meta?.role ?? '';

  if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
    redirect('/admin/access-denied');
  }

  return <>{children}</>;
}
