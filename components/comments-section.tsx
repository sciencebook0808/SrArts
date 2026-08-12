'use client';
/**
 * components/comments-section.tsx
 *
 * Inline comments section that opens the LinkedIn-style comment drawer.
 * Works across gallery, blog, and community pages.
 *
 * FIX (this audit): this component used to render TWO <CommentDrawer />
 * instances — one for the header button, one for the preview card. Each kept
 * its own comment list, its own total, and each independently probed the admin
 * API, so:
 *   • the header count and the preview count could disagree,
 *   • posting a comment in one drawer left the other stale,
 *   • every page did double the network work.
 * There is now one drawer; both triggers live here and drive it through
 * controlled `open` state, and the live total flows back via `onCountChange`.
 */

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { CommentDrawer } from '@/components/comments/comment-drawer';

interface Props {
  targetId:      string;
  targetType:    'artwork' | 'blog' | 'community';
  title?:        string;
  initialCount?: number;
}

export function CommentsSection({
  targetId,
  targetType,
  title        = 'Comments',
  initialCount = 0,
}: Props) {
  const [open,  setOpen]  = useState(false);
  const [total, setTotal] = useState(initialCount);

  return (
    <section className="mt-10 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          {title}
          {total > 0 && (
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              ({total})
            </span>
          )}
        </h2>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          aria-label={`Open comments${total > 0 ? ` (${total})` : ''}`}
        >
          <MessageCircle className="w-[18px] h-[18px] group-hover:text-primary transition-colors" />
          {total > 0 && <span className="font-medium tabular-nums">{total}</span>}
          <span className="hidden sm:inline text-xs">
            {total === 1 ? 'comment' : 'comments'}
          </span>
        </button>
      </div>

      {/* Clickable preview area — opens the same drawer */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left group"
      >
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {total > 0
            ? `View all ${total} comment${total === 1 ? '' : 's'}…`
            : 'Add a comment…'}
        </span>
      </button>

      {/* Single shared drawer, driven by the triggers above */}
      <CommentDrawer
        targetId={targetId}
        targetType={targetType}
        initialCount={initialCount}
        hideTrigger
        open={open}
        onOpenChange={setOpen}
        onCountChange={setTotal}
      />
    </section>
  );
}
