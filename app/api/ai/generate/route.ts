/**
 * app/api/ai/generate/route.ts
 *
 * Secure server-side Gemini AI route.
 * The API key is kept server-side — never exposed to the client.
 * Supports all AICommand types defined in the editor config.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { AICommand } from '@/components/editor/config/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

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
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI features require GEMINI_API_KEY to be configured.' },
        { status: 503 }
      );
    }

    const body = await req.json() as {
      command?: AICommand;
      selectedText?: string;
      fullContent?: string;
    };

    const { command, selectedText, fullContent } = body;

    if (!command || !selectedText?.trim()) {
      return NextResponse.json(
        { error: 'command and selectedText are required.' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(command, selectedText, fullContent);

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

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[AI Generate]', err);
    const message = err instanceof Error ? err.message : 'AI generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
