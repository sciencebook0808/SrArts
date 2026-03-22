/**
 * POST /api/community/[id]/repost — repost with optional note — Clerk auth required
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createRepost } from '@/lib/db-server';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to repost', authRequired: true },
      { status: 401 }
    );
  }

  const user             = await currentUser();
  const { id: repostOfId } = await params;

  try {
    const body = await request.json() as { note?: string };
    const post = await createRepost({
      authorId:    userId,
      authorName:  user?.fullName ?? user?.username ?? 'Anonymous',
      authorImage: user?.imageUrl,
      repostNote:  body.note?.trim() ?? '',
      repostOfId,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
