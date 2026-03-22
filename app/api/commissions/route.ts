import { NextRequest, NextResponse } from 'next/server';
import { getCommissions, createCommission } from '@/lib/db-server';
import { isAdminLoggedIn } from '@/lib/admin-auth';

export async function GET() {
  const loggedIn = await isAdminLoggedIn();
  if (!loggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const commissions = await getCommissions();
  return NextResponse.json({ commissions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      userName?: string;
      userEmail?: string;
      userPhone?: string;
      projectTitle?: string;
      description?: string;
      style?: string;
      budget?: string;
      timeline?: string;
    };

    if (!body.userName?.trim() || !body.userEmail?.trim()) {
      return NextResponse.json({ error: 'userName and userEmail are required' }, { status: 400 });
    }

    // Prisma nullable fields (String?) require string | null — never undefined.
    const commission = await createCommission({
      userName:     body.userName.trim(),
      userEmail:    body.userEmail.trim(),
      userPhone:    body.userPhone    ?? null,
      projectTitle: body.projectTitle ?? null,
      description:  body.description  ?? null,
      style:        body.style        ?? null,
      budget:       body.budget       ?? null,
      timeline:     body.timeline     ?? null,
    });

    return NextResponse.json({ commission }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
