import { NextRequest, NextResponse } from 'next/server';
import { deleteCategory } from '@/lib/db-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
