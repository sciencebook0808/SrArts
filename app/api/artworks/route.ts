import { NextRequest, NextResponse } from 'next/server';
import { getArtworks, createArtwork } from '@/lib/appwrite-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true'; // admin can see drafts
  const loggedIn = await isAdminLoggedIn();
  const artworks = await getArtworks(loggedIn && all ? false : true);
  return NextResponse.json({ artworks });
}

export async function POST(request: NextRequest) {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const artwork = await createArtwork(body);
    return NextResponse.json({ artwork }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create artwork';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
