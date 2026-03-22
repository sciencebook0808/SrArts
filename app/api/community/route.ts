/**
 * app/api/community/route.ts
 * GET  → { posts, total, hasMore }  — public
 * POST → { post }                   — requires Clerk auth
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getCommunityPosts, createCommunityPost } from '@/lib/db-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const take = Math.min(parseInt(searchParams.get('take') ?? '20'), 50);
  const skip = parseInt(searchParams.get('skip') ?? '0');

  const posts = await getCommunityPosts({ take, skip });
  return NextResponse.json({ posts, hasMore: posts.length === take });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to post', authRequired: true }, { status: 401 });
  }

  const user = await currentUser();
  try {
    const body = await request.json() as { content?: string; imageUrl?: string; imageId?: string };
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    const post = await createCommunityPost({
      authorId:    userId,
      authorName:  user?.fullName ?? user?.username ?? 'Anonymous',
      authorImage: user?.imageUrl ?? undefined,
      content:     body.content,
      imageUrl:    body.imageUrl,
      imageId:     body.imageId,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
