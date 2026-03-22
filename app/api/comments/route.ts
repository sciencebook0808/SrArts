/**
 * app/api/comments/route.ts
 * GET  → { comments }  — public
 * POST → { comment }   — requires Clerk auth
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getComments, createComment } from '@/lib/db-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetId   = searchParams.get('targetId')   ?? '';
  const targetType = searchParams.get('targetType') ?? '';

  if (!targetId || !['artwork', 'blog', 'community'].includes(targetType)) {
    return NextResponse.json({ error: 'targetId and targetType required' }, { status: 400 });
  }

  const comments = await getComments(targetId, targetType as 'artwork' | 'blog' | 'community');
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to comment', authRequired: true }, { status: 401 });
  }

  const user = await currentUser();

  try {
    const body = await request.json() as {
      targetId?: string; targetType?: string; message?: string;
    };
    const { targetId, targetType, message } = body;

    if (!targetId || !['artwork', 'blog', 'community'].includes(targetType ?? '')) {
      return NextResponse.json({ error: 'targetId and targetType required' }, { status: 400 });
    }
    if (!message || message.trim().length < 1) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const username  = user?.fullName ?? user?.username ?? user?.emailAddresses[0]?.emailAddress ?? 'Anonymous';

    const comment = await createComment({
      targetId, targetType: targetType as 'artwork' | 'blog' | 'community',
      userId, username, userImage: user?.imageUrl, message: message.trim(),
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
