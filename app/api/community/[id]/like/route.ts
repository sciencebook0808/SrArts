/**
 * GET  /api/community/[id]/like → { count, liked }
 * POST /api/community/[id]/like → toggle like — Clerk auth required
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  toggleCommunityLike,
  hasCommunityLiked,
  getCommunityLikeCount,
} from '@/lib/db-server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id }     = await params;
  const { userId } = await auth();

  const [count, liked] = await Promise.all([
    getCommunityLikeCount(id),
    userId ? hasCommunityLiked(id, userId) : Promise.resolve(false),
  ]);
  return NextResponse.json({ count, liked });
}

export async function POST(_: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to like posts', authRequired: true },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    const result = await toggleCommunityLike(id, userId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
