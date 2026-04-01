import { NextRequest, NextResponse } from 'next/server';
import { deleteCategory } from '@/lib/db-server';
import { requireAdminClerk } from '@/lib/admin-auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_: NextRequest, { params }: Params) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  const { id } = await params;
  try {
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[api/categories/[id]]', err);
    return NextResponse.json({ error: 'Failed to process category request.' }, { status: 500 });
  }
}
