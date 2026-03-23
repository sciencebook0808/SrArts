import { NextRequest, NextResponse } from 'next/server';
import { deleteComment } from '@/lib/db-server';
import { requireAdminClerk } from '@/lib/admin-auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_: NextRequest, { params }: Params) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  const { id } = await params;
  try {
    await deleteComment(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
