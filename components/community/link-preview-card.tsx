'use client';
/**
 * components/community/link-preview-card.tsx
 *
 * Shows an OpenGraph preview card for a URL, similar to LinkedIn/Twitter.
 * Fetches metadata server-side via /api/link-preview.
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, X, Globe } from 'lucide-react';

export interface LinkPreviewData {
  url:         string;
  hostname:    string;
  title:       string;
  description: string;
  image:       string | null;
  favicon:     string | null;
}

interface Props {
  url:        string;
  onRemove?:  () => void;
  compact?:   boolean;
  className?: string;
}

export function LinkPreviewCard({ url, onRemove, compact = false, className = '' }: Props) {
  const [data, setData]     = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(false);
  const abortRef            = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(false);
    setData(null);

    const fetchPreview = async () => {
      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`,
          { signal: abortRef.current!.signal }
        );
        if (!res.ok) throw new Error('Failed');
        const json = await res.json() as LinkPreviewData;
        if (!cancelled) { setData(json); }
      } catch (err) {
        if (!cancelled && (err as Error).name !== 'AbortError') setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchPreview();
    return () => { cancelled = true; abortRef.current?.abort(); };
  }, [url]);

  return (
    <AnimatePresence>
      {(loading || data || error) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className={`relative rounded-xl border border-border overflow-hidden bg-white ${className}`}
        >
          {/* Remove button */}
          {onRemove && !loading && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/20 text-white
                flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="flex gap-3 p-3 animate-pulse">
              <div className={`shrink-0 rounded-lg bg-accent-subtle ${compact ? 'w-16 h-16' : 'w-24 h-24'}`} />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-accent-subtle rounded w-3/4" />
                <div className="h-2.5 bg-accent-subtle rounded w-full" />
                <div className="h-2.5 bg-accent-subtle rounded w-1/2" />
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent-subtle/50 transition-colors"
            >
              <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{url}</p>
                <p className="text-xs text-muted-foreground">Preview unavailable</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-auto" />
            </a>
          )}

          {/* Full preview */}
          {data && !loading && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex gap-3 hover:bg-accent-subtle/40 transition-colors group ${compact ? 'p-3' : ''}`}
            >
              {/* Image */}
              {data.image && !compact && (
                <div className="shrink-0 relative w-24 h-full min-h-[80px] bg-accent-subtle overflow-hidden">
                  <Image
                    src={data.image}
                    alt={data.title}
                    fill
                    className="object-cover"
                    sizes="100px"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              <div className={`flex-1 min-w-0 py-3 ${compact ? '' : 'px-4'}`}>
                {/* Hostname + favicon */}
                <div className="flex items-center gap-1.5 mb-1">
                  {data.favicon && (
                    <Image
                      src={data.favicon}
                      alt=""
                      width={14}
                      height={14}
                      className="rounded-sm"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    {data.hostname.replace('www.', '')}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {data.title}
                </p>

                {/* Description */}
                {data.description && !compact && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {data.description}
                  </p>
                )}
              </div>

              {compact && data.image && (
                <div className="shrink-0 relative w-16 h-16 rounded-lg overflow-hidden bg-accent-subtle">
                  <Image
                    src={data.image}
                    alt={data.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook: detects the first URL in a plain-text string
 */
export function useDetectedUrl(text: string, debounceMs = 600): string {
  const [url, setUrl] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const URL_RE = /https?:\/\/[^\s<>"{}|\\^[\]`]+/gi;
      const match = text.match(URL_RE);
      setUrl(match ? match[0] : '');
    }, debounceMs);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, debounceMs]);

  return url;
}
