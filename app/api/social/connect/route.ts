/**
 * app/api/social/connect/route.ts
 *
 * POST /api/social/connect
 *
 * Called from the admin UI when the admin wants to link their Clerk OAuth
 * account to a SocialAccount record. Verifies the token exists and stores
 * the clerkUserId + clerkProvider association.
 *
 * Body: { accountId: string, provider: "oauth_google"|"oauth_facebook"|"oauth_twitter" }
 * Response: { account } | { error }
 */

import { NextRequest, NextResponse }                  from 'next/server';
import { auth }                                        from '@clerk/nextjs/server';
import { requireAdminClerk }                           from '@/lib/admin-auth';
import { checkOAuthConnection }                        from '@/lib/social-oauth';
import prisma                                          from '@/lib/db';

const PROVIDER_LABELS: Record<string, string> = {
  oauth_google:   'Google (YouTube)',
  oauth_facebook: 'Facebook / Instagram',
  oauth_twitter:  'Twitter / X',
};

export async function POST(req: NextRequest) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { accountId, provider } = body as { accountId?: string; provider?: string };

  if (!accountId) return NextResponse.json({ error: 'accountId required' }, { status: 400 });
  if (!provider || !PROVIDER_LABELS[provider]) {
    return NextResponse.json(
      { error: `provider must be one of: ${Object.keys(PROVIDER_LABELS).join(', ')}` },
      { status: 400 },
    );
  }

  // Verify the OAuth token actually exists in Clerk for this user
  const { connected, scopes } = await checkOAuthConnection(userId, provider);
  if (!connected) {
    return NextResponse.json({
      error: `No ${PROVIDER_LABELS[provider]} connection found in Clerk. ` +
             `Please connect your ${PROVIDER_LABELS[provider]} account in your Clerk profile settings first.`,
      hint: 'Visit your profile → Connected accounts to add the social connection.',
    }, { status: 400 });
  }

  try {
    const account = await prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        clerkUserId:   userId,
        clerkProvider: provider,
        oauthConnected: true,
        fetchStatus:    'pending',
        lastFetchError: null,
      },
    });

    return NextResponse.json({
      account,
      message: `Connected via ${PROVIDER_LABELS[provider]}`,
      scopes,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    console.error('[social/connect]', err);
    return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { accountId } = body as { accountId?: string };
  if (!accountId) return NextResponse.json({ error: 'accountId required' }, { status: 400 });

  try {
    const account = await prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        clerkUserId:    null,
        clerkProvider:  null,
        oauthConnected: false,
        fetchStatus:    'pending',
      },
    });
    return NextResponse.json({ account, message: 'OAuth connection removed' });
  } catch {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
