/**
 * app/api/community/route.ts
 *
 * GET  /api/community → { posts, hasMore }      — public
 * POST /api/community → { post }                — Clerk auth required
 *
 * SECURITY (v2):
 *   • Content capped at MAX_POST_LENGTH (5 000 chars)
 *   • skip / take sanitised — no NaN, no negatives, hard ceiling on take
 *   • Internal error messages never exposed to client
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser }          from '@clerk/nextjs/server';
import { getCommunityPosts, createCommunityPost } from '@/lib/db-server';

const MAX_POST_LENGTH = 5_000;
const MAX_TAKE        = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const take     = Math.min(Math.max(1, parseInt(searchParams.get('take') ?? '20', 10) || 20), MAX_TAKE);
  const skip     = Math.max(0, parseInt(searchParams.get('skip') ?? '0', 10) || 0);
  const authorId = searchParams.get('authorId') ?? undefined;

  const posts = await getCommunityPosts({ take, skip, authorId });
  return NextResponse.json({ posts, hasMore: posts.length === take });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to post', authRequired: true },
      { status: 401 },
    );
  }

  const user = await currentUser();
  try {
    const body = await request.json() as {
      content?:  string;
      imageUrl?: string;
      imageId?:  string;
    };

    const content = body.content?.trim() ?? '';

    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }
    if (content.length > MAX_POST_LENGTH) {
      return NextResponse.json(
        { error: `Post must be ${MAX_POST_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    // Validate imageUrl is a real URL if provided
    if (body.imageUrl) {
      try {
        const u = new URL(body.imageUrl);
        if (!['https:'].includes(u.protocol)) throw new Error();
      } catch {
        return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
      }
    }

    const post = await createCommunityPost({
      authorId:    userId,
      authorName:  user?.fullName ?? user?.username ?? 'Anonymous',
      authorImage: user?.imageUrl,
      content,
      imageUrl:    body.imageUrl,
      imageId:     body.imageId,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error('[api/community] POST error:', err);
    return NextResponse.json(
      { error: 'Failed to create post. Please try again.' },
      { status: 500 },
    );
  }
}
