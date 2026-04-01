import { NextRequest, NextResponse } from 'next/server';
import { getArtworks, createArtwork } from '@/lib/db-server';
import { requireAdminClerk, isAdminUser } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const all      = new URL(request.url).searchParams.get('all') === 'true';
  const isAdmin  = await isAdminUser();
  const artworks = await getArtworks(isAdmin && all ? false : true);
  return NextResponse.json({ artworks });
}

export async function POST(request: NextRequest) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  try {
    const body    = await request.json() as Parameters<typeof createArtwork>[0];
    const artwork = await createArtwork(body);
    return NextResponse.json({ artwork }, { status: 201 });
  } catch (err: unknown) {
    console.error('[api/artworks]', err);
    return NextResponse.json({ error: 'Failed to process artwork request.' }, { status: 500 });
  }
}
