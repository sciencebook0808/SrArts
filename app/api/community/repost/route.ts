/**
 * POST /api/community/repost
 *
 * Creates a community post that references an external content item
 * (artwork or blog post). The reference metadata is cached on the row
 * so the feed can render it without additional DB lookups.
 *
 * Body:
 *   note            string (optional)
 *   referenceType   'artwork' | 'blog'
 *   referenceId     string
 *   referenceTitle  string
 *   referenceImage  string | null
 *   referenceSlug   string
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createExternalRepost } from '@/lib/db-server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to repost', authRequired: true },
      { status: 401 }
    );
  }

  const user = await currentUser();

  try {
    const body = await request.json() as {
      note?:           string;
      referenceType?:  string;
      referenceId?:    string;
      referenceTitle?: string;
      referenceImage?: string | null;
      referenceSlug?:  string;
    };

    if (!body.referenceType || !body.referenceId || !body.referenceTitle || !body.referenceSlug) {
      return NextResponse.json(
        { error: 'Missing required reference fields' },
        { status: 400 }
      );
    }

    if (!['artwork', 'blog'].includes(body.referenceType)) {
      return NextResponse.json(
        { error: 'Invalid referenceType — must be artwork or blog' },
        { status: 400 }
      );
    }

    const post = await createExternalRepost({
      authorId:       userId,
      authorName:     user?.fullName ?? user?.username ?? 'Anonymous',
      authorImage:    user?.imageUrl,
      note:           body.note?.trim() ?? '',
      referenceType:  body.referenceType as 'artwork' | 'blog',
      referenceId:    body.referenceId,
      referenceTitle: body.referenceTitle,
      referenceImage: body.referenceImage ?? null,
      referenceSlug:  body.referenceSlug,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    console.error('[api/community/repost]', err);
    return NextResponse.json(
      { error: 'Failed to repost.' },
      { status: 500 }
    );
  }
}
