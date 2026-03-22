/**
 * app/api/stats/route.ts
 *
 * GET /api/stats — returns public display stats from the database.
 * Used by the hero section and about page when stats need client-side refresh.
 *
 * Response: { artworks, clients, followers, posts }
 */
import { NextResponse } from 'next/server';
import { getPublicStats } from '@/lib/db-server';

export const revalidate = 120; // cache for 2 minutes

export async function GET() {
  const stats = await getPublicStats();
  return NextResponse.json(stats);
}
