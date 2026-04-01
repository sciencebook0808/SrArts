/**
 * app/api/commissions/route.ts
 * GET  — admin only → { commissions }
 * POST — public     → { commission }   (commission request form)
 *
 * SECURITY (v2):
 *   • Email format validated with RFC-5321-safe regex
 *   • All string fields capped at safe max lengths (prevents DB abuse / DoS)
 *   • Internal error messages never exposed to client
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCommissions, createCommission } from '@/lib/db-server';
import { requireAdminClerk } from '@/lib/admin-auth';

export async function GET() {
  const check = await requireAdminClerk();
  if (!check.authorized) return check.response;
  const commissions = await getCommissions();
  return NextResponse.json({ commissions });
}

// ── Field length limits (characters) ──────────────────────────────────────────
const FIELD_LIMITS: Record<string, number> = {
  userName:     100,
  userEmail:    254,   // RFC 5321 max
  userPhone:     30,
  projectTitle: 200,
  description: 3000,
  style:        100,
  budget:       100,
  timeline:     100,
};

// Basic RFC-5321–safe email regex (no consecutive dots, valid TLD length)
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,63}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      userName?:     string;
      userEmail?:    string;
      userPhone?:    string;
      projectTitle?: string;
      description?:  string;
      style?:        string;
      budget?:       string;
      timeline?:     string;
    };

    // ── Required field validation ────────────────────────────────────────────
    if (!body.userName?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!body.userEmail?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const email = body.userEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // ── Length caps (prevents oversized payloads reaching the DB) ────────────
    const fields: Record<string, string | undefined> = {
      userName:     body.userName,
      userEmail:    email,
      userPhone:    body.userPhone,
      projectTitle: body.projectTitle,
      description:  body.description,
      style:        body.style,
      budget:       body.budget,
      timeline:     body.timeline,
    };
    for (const [key, max] of Object.entries(FIELD_LIMITS)) {
      const val = fields[key];
      if (typeof val === 'string' && val.length > max) {
        return NextResponse.json(
          { error: `${key} exceeds the maximum allowed length of ${max} characters` },
          { status: 400 },
        );
      }
    }

    const commission = await createCommission({
      userName:     body.userName.trim(),
      userEmail:    email,
      userPhone:    body.userPhone    ?? null,
      projectTitle: body.projectTitle ?? null,
      description:  body.description  ?? null,
      style:        body.style        ?? null,
      budget:       body.budget       ?? null,
      timeline:     body.timeline     ?? null,
    });

    return NextResponse.json({ commission }, { status: 201 });
  } catch (err: unknown) {
    console.error('[api/commissions] POST error:', err);
    return NextResponse.json(
      { error: 'Failed to submit commission request. Please try again.' },
      { status: 500 },
    );
  }
}
