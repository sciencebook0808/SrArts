/**
 * GET    /api/community/[id] — public single post
 * DELETE /api/community/[id] — author (or admin) may delete
 *
 * FIX (this audit): the DELETE catch block built a *hardcoded* message and then
 * branched on it:
 *     const message = 'Failed to process post.';
 *     const status  = message.startsWith('Forbidden') ? 403 : 500;
 * `message` never starts with "Forbidden", so a user deleting someone else's
 * post always received 500 "Failed to process post." instead of 403. The real
 * thrown error is now inspected, and admins can moderate posts too.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCommunityPost, deleteCommunityPost } from '@/lib/db-server';
import { isAdminUser } from '@/lib/admin-auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const post = await getCommunityPost(id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    // Admins may moderate any post; everyone else only their own.
    const asAdmin = await isAdminUser();
    await deleteCommunityPost(id, userId, { asAdmin });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : '';

    if (raw.startsWith('Forbidden')) {
      return NextResponse.json(
        { error: 'You can only delete your own posts.' },
        { status: 403 },
      );
    }
    if (raw.toLowerCase().includes('not found')) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    console.error('[api/community/[id] DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 });
  }
}
