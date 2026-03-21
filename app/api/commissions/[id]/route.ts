import { NextRequest, NextResponse } from 'next/server';
import { updateCommissionStatus } from '@/lib/appwrite-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const { status } = await request.json();
    const updated = await updateCommissionStatus(id, status);
    return NextResponse.json({ commission: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
