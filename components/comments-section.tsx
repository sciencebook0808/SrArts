'use client';
/**
 * components/comments-section.tsx
 *
 * Inline comments section that opens the LinkedIn-style comment drawer.
 * Works across gallery, blog, and community pages.
 */

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
  return (
    <section className="mt-10 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          {title}
          {initialCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">({initialCount})</span>
          )}
        </h2>

        {/* Primary trigger button */}
        <CommentDrawer
          targetId={targetId}
          targetType={targetType}
          initialCount={initialCount}
        />
      </div>

      {/* Clickable preview area — also opens drawer */}
      <CommentDrawer
        targetId={targetId}
        targetType={targetType}
        initialCount={initialCount}
        asPreview
      />
    </section>
  );
}
