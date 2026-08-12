/**
 * app/api/ai/generate/route.ts
 *
 * Server-side Gemini AI route for the editor's AI panel.
 * The API key is kept server-side — never exposed to the client.
 * Supports all AICommand types defined in the editor config.
 *
 * SECURITY FIX (this audit):
 *  This route previously had NO authentication and NO rate limiting. Any
 *  anonymous visitor could POST arbitrary prompts and bill them to the site's
 *  Gemini key — a straightforward cost-exhaustion vector, and effectively a
 *  free public LLM proxy. It now requires a signed-in Clerk user (the editor
 *  is only reachable when signed in anyway) and enforces a per-user quota.
 *  Internal error messages are no longer echoed back to the client.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimit, recordHit, type RateLimitRule } from '@/lib/rate-limiter';
import type { AICommand } from '@/components/editor/config/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

/** Generous enough for real editing sessions, tight enough to stop abuse. */
const AI_RULES: RateLimitRule[] = [
  { windowMs:    60_000, limit: 10, label: 'minute' },
  { windowMs: 3_600_000, limit: 60, label: 'hour'   },
];

/** Caps on prompt inputs so a single request cannot blow up token spend. */
const MAX_SELECTED_TEXT = 8_000;
const MAX_FULL_CONTENT  = 12_000;

/** Every command the editor may dispatch — anything else is rejected. */
const VALID_COMMANDS = new Set<AICommand>([
  'improve', 'rewrite', 'summarize', 'expand', 'shorten', 'fix-grammar',
  'tone-professional', 'tone-casual', 'tone-friendly', 'seo-optimize',
  'caption-instagram', 'caption-youtube', 'caption-facebook',
]);

// ── System prompt per command ─────────────────────────────────────────────────
function buildPrompt(command: AICommand, selectedText: string, fullContent?: string): string {
  const context = fullContent && fullContent !== selectedText
    ? `\n\nFull document context:\n"""\n${fullContent.slice(0, 2000)}\n"""`
    : '';

  const text = `"""\n${selectedText}\n"""`;

  const instructions: Record<AICommand, string> = {
    improve: `Improve the writing quality of the following text. Make it more clear, engaging, and polished. Preserve the original meaning and intent. Return only the improved text, no commentary.\n\nText:\n${text}${context}`,
    rewrite: `Completely rewrite the following text to say the same thing in a fresh, new way. Keep the same core meaning but use different phrasing, structure, and vocabulary.\n\nText:\n${text}${context}`,
    summarize: `Write a concise summary of the following text. Capture all key points in 2-4 sentences maximum.\n\nText:\n${text}${context}`,
    expand: `Expand and elaborate on the following text. Add more detail, examples, and depth while staying on topic.\n\nText:\n${text}${context}`,
    shorten: `Make the following text shorter and more concise. Remove filler words, redundancy, and unnecessary details while keeping all key information.\n\nText:\n${text}${context}`,
    'fix-grammar': `Fix all grammar, spelling, and punctuation errors in the following text. Return only the corrected text with no explanations.\n\nText:\n${text}`,
    'tone-professional': `Rewrite the following text in a professional, formal tone suitable for business communication. Keep the same meaning.\n\nText:\n${text}${context}`,
    'tone-casual': `Rewrite the following text in a casual, conversational tone. Make it feel relaxed and approachable.\n\nText:\n${text}${context}`,
    'tone-friendly': `Rewrite the following text in a warm, friendly, and encouraging tone. Keep the same meaning but make it feel welcoming.\n\nText:\n${text}${context}`,
    'seo-optimize': `Rewrite the following text to be SEO-optimized. Improve keyword density naturally, use action words, and make headings/subheadings clear and compelling. Do not keyword-stuff.\n\nText:\n${text}${context}`,
    'caption-instagram': `Write an engaging Instagram caption for the following content. Include:\n- A hook opening line\n- 3-5 relevant emojis integrated naturally\n- A call-to-action at the end\n- 15-20 relevant hashtags\n\nContent:\n${text}${context}`,
    'caption-youtube': `Write a YouTube video description for the following content. Include:\n- A compelling opening 2-3 sentences (most important for SEO)\n- 3-5 bullet point timestamps/sections (use 0:00 format)\n- A call-to-action to like, subscribe, and comment\n- 5-10 relevant tags\n\nContent:\n${text}${context}`,
    'caption-facebook': `Write an engaging Facebook post for the following content. Make it conversational, include a question to drive comments, and keep it under 250 words for best engagement.\n\nContent:\n${text}${context}`,
  };

  return instructions[command] ?? `Process the following text:\n\n${text}`;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Auth: signed-in users only ─────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to use AI features.', authRequired: true },
      { status: 401 },
    );
  }

  // ── Per-user quota ─────────────────────────────────────────────────────────
  const rl = checkRateLimit('ai-generate', userId, AI_RULES);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'AI request limit reached. Please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.retryAfterMs ?? 60_000) / 1000)) },
      },
    );
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI features require GEMINI_API_KEY to be configured.' },
        { status: 503 }
      );
    }

    let body: {
      command?: AICommand;
      selectedText?: string;
      fullContent?: string;
    };
    try {
      body = await req.json() as typeof body;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { command, selectedText, fullContent } = body;

    if (!command || !selectedText?.trim()) {
      return NextResponse.json(
        { error: 'command and selectedText are required.' },
        { status: 400 }
      );
    }

    // Only commands we actually define may be dispatched.
    if (!VALID_COMMANDS.has(command)) {
      return NextResponse.json({ error: 'Unknown AI command.' }, { status: 400 });
    }

    const prompt = buildPrompt(
      command,
      selectedText.slice(0, MAX_SELECTED_TEXT),
      fullContent?.slice(0, MAX_FULL_CONTENT),
    );

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const result = response.text ?? '';

    if (!result) {
      return NextResponse.json({ error: 'No response from AI.' }, { status: 500 });
    }

    // Only count successful generations against the user's quota.
    recordHit('ai-generate', userId);

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[AI Generate]', err);
    // Never echo the provider error back — it can leak key/quota/project details.
    return NextResponse.json(
      { error: 'AI generation failed. Please try again.' },
      { status: 500 },
    );
  }
}
