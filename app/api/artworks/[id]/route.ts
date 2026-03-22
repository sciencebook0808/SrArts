import { NextRequest, NextResponse } from 'next/server';
import { getArtwork, updateArtwork, deleteArtwork } from '@/lib/db-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = await getArtwork(id);
  if (!artwork) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ artwork });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json() as Parameters<typeof updateArtwork>[1];
    const artwork = await updateArtwork(id, body);
    return NextResponse.json({ artwork });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await deleteArtwork(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
