import { NextResponse } from 'next/server';
import { isAdminLoggedIn } from '@/lib/admin-auth';
import { getAllComments } from '@/lib/db-server';

export async function GET() {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const comments = await getAllComments();
  return NextResponse.json({ comments });
}
