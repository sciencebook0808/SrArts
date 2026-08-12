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
 *
 * SECURITY FIX (this audit): the route used to trust `referenceTitle`,
 * `referenceImage` and `referenceSlug` straight from the request body. A user
 * could therefore publish a post that displayed an arbitrary title and image
 * while linking to a real artwork — content spoofing, and a way to smuggle
 * arbitrary image URLs into the feed. The reference is now resolved from the
 * database by id, and any client-supplied metadata is ignored.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import {
  createExternalRepost,
  getArtwork, getArtworkBySlug,
  getBlogPost, getBlogPostBySlug,
} from '@/lib/db-server';

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
      note?:          string;
      referenceType?: string;
      referenceId?:   string;
    };

    if (!body.referenceType || !body.referenceId) {
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

    const referenceType = body.referenceType as 'artwork' | 'blog';

    // Resolve the referenced item server-side — never trust client metadata.
    let title: string;
    let image: string | null;
    let slug:  string;

    if (referenceType === 'artwork') {
      const artwork = await getArtwork(body.referenceId)
        ?? await getArtworkBySlug(body.referenceId);
      if (!artwork || artwork.status !== 'published') {
        return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
      }
      title = artwork.title;
      image = artwork.imageUrl || null;
      slug  = artwork.slug;
    } else {
      const blog = await getBlogPost(body.referenceId)
        ?? await getBlogPostBySlug(body.referenceId);
      if (!blog || blog.status !== 'published') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      title = blog.title;
      image = blog.coverImage;
      slug  = blog.slug;
    }

    const post = await createExternalRepost({
      authorId:       userId,
      authorName:     user?.fullName ?? user?.username ?? 'Anonymous',
      authorImage:    user?.imageUrl,
      note:           body.note?.trim() ?? '',
      referenceType,
      referenceId:    body.referenceId,
      referenceTitle: title,
      referenceImage: image,
      referenceSlug:  slug,
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
