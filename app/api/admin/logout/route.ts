/**
 * app/api/admin/logout/route.ts
 *
 * Session cookie logout removed (v12). Admin sign-out is handled
 * client-side via Clerk's useClerk().signOut() or <UserButton>.
 * This endpoint is kept for backward compatibility and returns success.
 */
import { NextResponse } from 'next/server';

export async function POST() {
  // Clerk sign-out happens client-side — nothing to do server-side
  return NextResponse.json({ success: true });
}
