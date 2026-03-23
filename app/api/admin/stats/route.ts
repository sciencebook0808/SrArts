/**
 * app/api/admin/stats/route.ts
 *
 * GET /api/admin/stats — dashboard overview counts (admin only)
 *
 * Returns a single DB query result with counts for all four stat cards.
 * Replaces the old pattern of 3 separate API calls from the dashboard client.
 *
 * Response: { artworksTotal, blogTotal, ordersTotal, communityTotal }
 */
import { NextResponse }       from 'next/server';
import { requireAdminClerk }  from '@/lib/admin-auth';
import { getDashboardStats }  from '@/lib/db-server';

export async function GET() {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
