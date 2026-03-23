/**
 * app/api/admin/login/route.ts
 *
 * Password-based admin authentication has been removed (v12).
 * Admin access is now managed via Clerk publicMetadata.role.
 *
 * To grant admin access:
 *   Clerk Dashboard → Users → [User] → Public Metadata → { "role": "admin" }
 */
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:   'Password authentication has been removed.',
      message: 'Admin access is now managed via Clerk roles. Sign in at /admin/login.',
    },
    { status: 410 },
  );
}
