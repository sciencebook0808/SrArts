import { NextRequest, NextResponse } from 'next/server';
import { updateCommissionStatus } from '@/lib/db-server';
import { requireAdminClerk } from '@/lib/admin-auth';

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

export async function PATCH(request: NextRequest, { params }: Params) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  const { id } = await params;
  try {
    const body = await request.json() as { status?: string };

    if (!body.status || !VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const commission = await updateCommissionStatus(id, body.status);
    return NextResponse.json({ commission });
  } catch (err: unknown) {
    console.error('[api/commissions/[id]]', err);
    return NextResponse.json(
      { error: 'Failed to process commission.' },
      { status: 500 }
    );
  }
}
