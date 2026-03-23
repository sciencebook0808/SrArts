/**
 * app/(admin)/layout.tsx
 *
 * Admin guard layout — wraps ONLY the routes inside this (admin) route group:
 *   /admin/dashboard
 *   /admin/artworks/**
 *   /admin/blog/**
 *
 * CRITICAL: /admin/login and /admin/access-denied live in app/admin/ (NOT
 * inside this group) so this layout NEVER wraps them. That eliminates the
 * infinite-loop that previously occurred when this layout redirected to
 * /admin/access-denied which then triggered the layout again.
 *
 * FLOW:
 *   1. proxy.ts (middleware) — pre-render, handles unauthenticated users
 *   2. This layout — server-side safety net, handles authenticated-but-no-role users
 *
 * Both redirect targets (/admin/login, /admin/access-denied) are OUTSIDE
 * this route group → zero possibility of a redirect loop.
 */

import { redirect } from 'next/navigation';
import { auth }     from '@clerk/nextjs/server';

interface Props { children: React.ReactNode }

const ADMIN_ROLES = ['admin', 'superadmin'] as const;

export default async function AdminGuardLayout({ children }: Props) {
  const { userId, sessionClaims } = await auth();

  // Not signed in → send to login page (OUTSIDE this layout's scope → no loop)
  if (!userId) {
    redirect('/admin/login');
  }

  // Signed in but no admin role → access denied (OUTSIDE this layout's scope → no loop)
  const meta = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const role = meta?.role ?? '';

  if (!(ADMIN_ROLES as readonly string[]).includes(role)) {
    redirect('/admin/access-denied');
  }

  return <>{children}</>;
}
