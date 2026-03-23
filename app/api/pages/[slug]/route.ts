/**
 * app/api/pages/[slug]/route.ts
 *
 * GET  /api/pages/terms   → { page: StaticPage | null }  — public
 * GET  /api/pages/privacy → { page: StaticPage | null }  — public
 * PUT  /api/pages/:slug   → { page: StaticPage }         — admin only
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStaticPage, upsertStaticPage } from '@/lib/db-server';
import type { StaticPageSlug } from '@/lib/db-server';
import { requireAdminClerk } from '@/lib/admin-auth';

type Params = { params: Promise<{ slug: string }> };

function assertSlug(slug: string): StaticPageSlug {
  if (slug !== 'terms' && slug !== 'privacy') {
    throw new Error(`Invalid page slug: ${slug}`);
  }
  return slug;
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const pageSlug = assertSlug(slug);
    const page = await getStaticPage(pageSlug);
    return NextResponse.json({ page });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Not found' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  try {
    const { slug } = await params;
    const pageSlug = assertSlug(slug);

    const body = await request.json() as { title?: string; content?: string };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (body.content === undefined || body.content === null) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const page = await upsertStaticPage(pageSlug, {
      title:   body.title.trim(),
      content: body.content,
    });

    return NextResponse.json({ page });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
