import { NextResponse } from 'next/server';
import { requireAdminClerk } from '@/lib/admin-auth';
import { getAllComments } from '@/lib/db-server';

export async function GET() {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  const comments = await getAllComments();
  return NextResponse.json({ comments });
}
