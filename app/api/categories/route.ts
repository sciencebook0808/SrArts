import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/db-server';
import { requireAdminClerk } from '@/lib/admin-auth';

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  try {
    const body = await request.json() as { name: string; slug: string; order?: number };
    const category = await createCategory({ name: body.name, slug: body.slug, order: body.order ?? 0 });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
