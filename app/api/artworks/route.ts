// ═══════════════════════════════════════════════════════════════════════════════
// app/api/artworks/route.ts
// ═══════════════════════════════════════════════════════════════════════════════
// NOTE: Copy this section into app/api/artworks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getArtworks, createArtwork } from '@/lib/db-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const all = new URL(request.url).searchParams.get('all') === 'true';
  const loggedIn = await isAdminLoggedIn();
  const artworks = await getArtworks(loggedIn && all ? false : true);
  return NextResponse.json({ artworks });
}

export async function POST(request: NextRequest) {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json() as Parameters<typeof createArtwork>[0];
    const artwork = await createArtwork(body);
    return NextResponse.json({ artwork }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
