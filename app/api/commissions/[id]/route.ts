import { NextRequest, NextResponse } from 'next/server';
import { updateCommissionStatus } from '@/lib/db-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await isAdminLoggedIn())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json() as { status: string };
    const commission = await updateCommissionStatus(id, body.status);
    return NextResponse.json({ commission });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
