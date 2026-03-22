import { NextRequest, NextResponse } from 'next/server';
import { updateCommissionStatus } from '@/lib/db-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const { status } = await request.json() as { status: string };
    const commission = await updateCommissionStatus(id, status);
    return NextResponse.json({ commission });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
