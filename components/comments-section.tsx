'use client';
/**
 * components/comments-section.tsx
 *
 * Backward-compatible wrapper that renders:
 *   1. A "Comments" section header with count badge
 *   2. The YouTube Shorts-style CommentDrawer trigger
 *
 * Usage (unchanged from before — all existing pages work without modification):
 *   <CommentsSection targetId={artwork.id} targetType="artwork" />
 *   <CommentsSection targetId={post.id}    targetType="community" />
 *   <CommentsSection targetId={blog.id}    targetType="blog" />
 *
 * The drawer opens on click of the trigger button.
 * Initial count can be passed for SSR consistency; the drawer fetches live data.
 */

import { MessageCircle } from 'lucide-react';
import { CommentDrawer } from '@/components/comments/comment-drawer';

interface Props {
  targetId:     string;
  targetType:   'artwork' | 'blog' | 'community';
  title?:       string;
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
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          {title}
        </h2>

        {/* Drawer trigger — opens the full comment experience */}
        <CommentDrawer
          targetId={targetId}
          targetType={targetType}
          initialCount={initialCount}
        />
      </div>

      {/* Invite to click */}
      <p className="text-sm text-muted-foreground">
        {initialCount > 0
          ? `${initialCount} comment${initialCount === 1 ? '' : 's'} — tap to read & reply`
          : 'Be the first to comment'}
      </p>
    </section>
  );
}
