/**
 * lib/admin-auth.ts — Clerk role-based admin authentication (v12, March 2026)
 *
 * MIGRATION NOTE:
 *  Cookie/password auth has been replaced with Clerk publicMetadata roles.
 *  Set roles in: Clerk Dashboard → Users → [User] → Public Metadata
 *    { "role": "admin" }       ← full admin access
 *    { "role": "superadmin" }  ← full admin access + elevated trust
 *
 * USAGE in API route handlers:
 *   const check = await requireAdminClerk();
 *   if (!check.authorized) return check.response;
 *   // check.userId and check.role are now available
 *
 * USAGE in Server Components / layouts:
 *   const isAdmin = await isAdminUser();
 *   if (!isAdmin) redirect('/admin/access-denied');
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export type AdminRole = 'admin' | 'superadmin';

const ADMIN_ROLES: readonly string[] = ['admin', 'superadmin'] as const;

// ─── API route guard ──────────────────────────────────────────────────────────

type AuthorizedResult   = { authorized: true;  userId: string; role: AdminRole };
type UnauthorizedResult = { authorized: false; response: NextResponse };

/**
 * Use at the top of every admin-protected API route handler.
 * Returns a typed discriminated union so TypeScript narrows correctly.
 */
export async function requireAdminClerk(): Promise<AuthorizedResult | UnauthorizedResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Authentication required.' },
          { status: 401 },
        ),
      };
    }

    const meta = sessionClaims?.publicMetadata as { role?: string } | undefined;
    const role = meta?.role ?? '';

    if (!ADMIN_ROLES.includes(role)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden. Admin role required.' },
          { status: 403 },
        ),
      };
    }

    return { authorized: true, userId, role: role as AdminRole };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Authentication service error.' },
        { status: 500 },
      ),
    };
  }
}

// ─── Server Component / layout helper ────────────────────────────────────────

/**
 * Returns true if the current Clerk session has admin or superadmin role.
 * Use in Server Components and layouts.
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;
    const meta = sessionClaims?.publicMetadata as { role?: string } | undefined;
    return ADMIN_ROLES.includes(meta?.role ?? '');
  } catch {
    return false;
  }
}

/**
 * Returns the role string for the current session, or null if not admin.
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return null;
    const meta = sessionClaims?.publicMetadata as { role?: string } | undefined;
    const role = meta?.role ?? '';
    return ADMIN_ROLES.includes(role) ? (role as AdminRole) : null;
  } catch {
    return null;
  }
}
