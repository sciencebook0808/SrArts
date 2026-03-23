/**
 * lib/admin-auth.ts — Clerk role-based admin authentication (v17)
 *
 * ROOT CAUSE FIX:
 *  Previous versions read role from `sessionClaims?.publicMetadata`.
 *  Clerk does NOT embed publicMetadata in the JWT by default, so that field
 *  is always undefined — meaning every admin check silently failed even when
 *  the role was correctly set in Clerk Dashboard.
 *
 *  FIX: Use `currentUser()` (server components) and `clerkClient().users.getUser()`
 *  (API routes) which hit the Clerk API directly and always return the real,
 *  live publicMetadata. No JWT template customisation required.
 *
 * ROLE SETUP (unchanged):
 *  Clerk Dashboard → Users → [User] → Public Metadata → { "role": "admin" }
 *  Supported values: "admin" | "superadmin"
 *
 * USAGE in API route handlers:
 *   const check = await requireAdminClerk();
 *   if (!check.authorized) return check.response;
 *
 * USAGE in Server Components / layouts:
 *   const isAdmin = await isAdminUser();
 *   if (!isAdmin) redirect('/admin/access-denied');
 */

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { NextResponse }                   from 'next/server';

export type AdminRole = 'admin' | 'superadmin';

const ADMIN_ROLES: readonly string[] = ['admin', 'superadmin'] as const;

// ─── Internal: fetch role from live Clerk user object ────────────────────────

/**
 * Gets the admin role for a userId directly from the Clerk API.
 * Never reads from JWT claims — always reflects the latest publicMetadata.
 */
async function getRoleFromClerk(userId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const user   = await client.users.getUser(userId);
    const meta   = user.publicMetadata as { role?: string } | undefined;
    return meta?.role ?? '';
  } catch {
    return '';
  }
}

// ─── API route guard ──────────────────────────────────────────────────────────

type AuthorizedResult   = { authorized: true;  userId: string; role: AdminRole };
type UnauthorizedResult = { authorized: false; response: NextResponse };

/**
 * Use at the top of every admin-protected API route handler.
 *
 * Reads publicMetadata directly from the Clerk API — not from JWT claims —
 * so role changes take effect immediately without requiring re-login.
 */
export async function requireAdminClerk(): Promise<AuthorizedResult | UnauthorizedResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Authentication required.' },
          { status: 401 },
        ),
      };
    }

    const role = await getRoleFromClerk(userId);

    if (!ADMIN_ROLES.includes(role)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden. Admin role required.', role },
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

// ─── Server Component helpers ─────────────────────────────────────────────────

/**
 * Returns true if the current user has admin or superadmin role.
 *
 * Uses currentUser() which fetches the full user from Clerk's API,
 * including publicMetadata — never relies on JWT claims.
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;
    const meta = user.publicMetadata as { role?: string } | undefined;
    return ADMIN_ROLES.includes(meta?.role ?? '');
  } catch {
    return false;
  }
}

/**
 * Returns the role string for the current user, or null if not admin.
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  try {
    const user = await currentUser();
    if (!user) return null;
    const meta = user.publicMetadata as { role?: string } | undefined;
    const role = meta?.role ?? '';
    return ADMIN_ROLES.includes(role) ? (role as AdminRole) : null;
  } catch {
    return null;
  }
}
