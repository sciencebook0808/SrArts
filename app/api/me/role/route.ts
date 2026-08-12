/**
 * GET /api/me/role → { signedIn, isAdmin }
 *
 * Tiny endpoint so client components can find out whether the current user may
 * moderate content (delete anyone's comment) without probing an admin-only
 * route.
 *
 * WHY: the comment drawer used to detect admins by calling
 * `/api/admin/stats` and treating a 200 as "is admin". That fired a real
 * dashboard query for every signed-in visitor on every artwork/blog page, and
 * produced a stream of 403s in the logs for everyone else. This route always
 * answers 200 with a boolean and does no database work.
 */
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/admin-auth';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ signedIn: false, isAdmin: false });
  }

  const isAdmin = await isAdminUser();
  return NextResponse.json(
    { signedIn: true, isAdmin },
    // Per-user answer — must never be shared by a CDN.
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
