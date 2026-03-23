import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts, createBlogPost } from '@/lib/db-server';
import { requireAdminClerk, isAdminUser } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const all     = new URL(request.url).searchParams.get('all') === 'true';
  const isAdmin = await isAdminUser();
  const posts   = await getBlogPosts(isAdmin && all ? false : true);
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  try {
    const body = await request.json() as Parameters<typeof createBlogPost>[0];
    const post = await createBlogPost(body);
    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
