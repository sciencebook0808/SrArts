'use client';
/**
 * components/editor/hooks/use-gemini.ts
 *
 * React hook for Gemini AI actions — calls the secure server-side
 * /api/ai/generate route. Manages loading/error/result state.
 */
import { useState, useCallback } from 'react';
import type { AICommand } from '../config/types';

interface UseGeminiReturn {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  generate: (opts: { command: AICommand; selectedText: string; fullContent?: string }) => Promise<string | null>;
  reset: () => void;
}

export function useGemini(): UseGeminiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const generate = useCallback(async (opts: {
    command: AICommand;
    selectedText: string;
    fullContent?: string;
  }): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? `AI request failed (${res.status})`);
      }

      const data = await res.json() as { result?: string; error?: string };
      if (data.error) throw new Error(data.error);

      const text = data.result ?? '';
      setResult(text);
      return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
    setIsLoading(false);
  }, []);

  return { isLoading, error, result, generate, reset };
}
