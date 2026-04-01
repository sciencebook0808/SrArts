/**
 * app/api/likes/[artworkId]/route.ts
 * GET  → { count, liked }
 * POST → toggle like { count, liked }   — requires Clerk auth
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getLikeCount, hasLiked, toggleArtworkLike } from '@/lib/db-server';

type Params = { params: Promise<{ artworkId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { artworkId } = await params;
  const { userId } = await auth();

  const [count, liked] = await Promise.all([
    getLikeCount(artworkId),
    userId ? hasLiked(artworkId, userId) : Promise.resolve(false),
  ]);

  return NextResponse.json({ count, liked });
}

export async function POST(_: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to like artworks', authRequired: true }, { status: 401 });
  }

  const { artworkId } = await params;
  try {
    const result = await toggleArtworkLike(artworkId, userId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('[api/likes]', err);
    return NextResponse.json({ error: 'Failed to process like request.' }, { status: 500 });
  }
}
