/**
 * components/prose-content.tsx
 *
 * Shared component for rendering Tiptap-generated HTML consistently
 * across the entire app: blog posts, community posts, terms, privacy.
 *
 * Handles all Tiptap output correctly:
 *  - Headings H1–H6 with tight tracking
 *  - Bold / italic / underline / strikethrough / code
 *  - Text color and background-color inline styles (pass-through)
 *  - Font-family and font-size inline styles (pass-through)
 *  - Text-align (left / center / right / justify)
 *  - Blockquotes with colored left border
 *  - Ordered / unordered / task lists (checkbox)
 *  - Code blocks (pre)
 *  - Tables with borders
 *  - Images (rounded, shadow)
 *  - YouTube / iframe embeds (16:9 aspect ratio)
 *  - Horizontal rules
 *  - Superscript / subscript
 *  - Links (primary color, underline)
 *  - Social media blocks (figure wrappers)
 *  - Highlighted text spans
 *
 * Size variants:
 *  - "sm"  → prose-sm  (community post cards / feed previews)
 *  - "base"→ prose-base (community post detail, sidebar)
 *  - "lg"  → prose-lg  (blog posts, terms, privacy)
 *
 * Clamping:
 *  - `clamp` prop trims long content to N lines for feed cards
 */

import { cn } from '@/lib/utils';

interface ProseContentProps {
  html: string;
  size?: 'sm' | 'base' | 'lg';
  /** Clamp to N lines (CSS line-clamp). Pass 0 to disable. */
  clampLines?: number;
  className?: string;
}

const SIZE_MAP = {
  sm:   'prose-sm',
  base: 'prose-base',
  lg:   'prose-lg',
};

export function ProseContent({
  html,
  size = 'base',
  clampLines = 0,
  className,
}: ProseContentProps) {
  // Detect plain text (legacy posts that were stored as plain strings)
  const isHtml = html.trimStart().startsWith('<');

  if (!isHtml) {
    return (
      <p
        className={cn(
          'text-sm leading-relaxed whitespace-pre-wrap text-foreground/90',
          clampLines > 0 && `line-clamp-${clampLines}`,
          className,
        )}
      >
        {html}
      </p>
    );
  }

  return (
    <div
      className={cn(
        // Core prose
        'prose max-w-none',
        SIZE_MAP[size],

        // Heading styles
        'prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground',
        'prose-headings:leading-tight prose-headings:scroll-mt-24',
        'prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg',

        // Paragraph
        'prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:my-[0.65em]',

        // Inline marks
        'prose-strong:font-bold prose-strong:text-foreground',
        'prose-em:italic',
        'prose-code:bg-gray-100 prose-code:text-rose-600 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',

        // Links
        'prose-a:text-primary prose-a:underline prose-a:underline-offset-2 prose-a:decoration-primary/40 hover:prose-a:decoration-primary prose-a:transition-colors',

        // Blockquote
        'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-muted-foreground prose-blockquote:bg-accent-subtle/30 prose-blockquote:py-1 prose-blockquote:rounded-r-lg',

        // Code block (pre)
        'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:overflow-x-auto prose-pre:text-sm',
        'prose-pre:before:content-none prose-pre:after:content-none',

        // Lists
        'prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5',
        'prose-li:text-foreground/90 prose-li:my-0.5',

        // Task lists (Tiptap TaskItem output: <ul class="task-list"><li class="task-item">)
        '[&_.task-list]:list-none [&_.task-list]:pl-0',
        '[&_.task-item]:flex [&_.task-item]:items-baseline [&_.task-item]:gap-2',
        '[&_.task-item_>_label]:flex [&_.task-item_>_label]:items-center [&_.task-item_>_label]:gap-2 [&_.task-item_>_label]:cursor-pointer',
        '[&_.task-item_input[type=checkbox]]:w-4 [&_.task-item_input[type=checkbox]]:h-4 [&_.task-item_input[type=checkbox]]:accent-primary [&_.task-item_input[type=checkbox]]:mt-0.5 [&_.task-item_input[type=checkbox]]:shrink-0',

        // Images (from Tiptap Image / CustomImage)
        'prose-img:rounded-xl prose-img:shadow-md prose-img:my-4 prose-img:mx-auto',
        '[&_figure]:my-4 [&_figure]:mx-auto',
        '[&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_figcaption]:italic [&_figcaption]:mt-1.5',

        // YouTube / iframes (Tiptap YouTube extension output)
        '[&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:aspect-video [&_iframe]:border-0 [&_iframe]:shadow-md [&_iframe]:my-4',
        '[&_.youtube-wrapper]:my-4 [&_.youtube-wrapper]:rounded-xl [&_.youtube-wrapper]:overflow-hidden',

        // Tables (Tiptap Table extension output)
        'prose-table:border-collapse prose-table:w-full prose-table:overflow-x-auto prose-table:block prose-table:text-sm',
        'prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:font-semibold prose-th:text-left',
        'prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2 prose-td:align-top',
        '[&_tr:nth-child(even)_td]:bg-gray-50/50',

        // HR
        'prose-hr:border-border prose-hr:my-6',

        // Superscript / subscript (Tiptap outputs native HTML)
        '[&_sup]:text-xs [&_sup]:align-super',
        '[&_sub]:text-xs [&_sub]:align-sub',

        // Mark / highlight (Tiptap Highlight extension outputs <mark style="background-color:...">)
        '[&_mark]:px-1 [&_mark]:py-0.5 [&_mark]:rounded [&_mark]:not-italic',

        // Social block nodes (figure wrappers with data-type)
        '[&_[data-type]]:my-4',

        // Dark mode
        'dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-gray-300',
        'dark:prose-code:bg-gray-800 dark:prose-code:text-rose-400',
        'dark:prose-pre:bg-gray-950',
        'dark:prose-th:bg-gray-800 dark:prose-th:border-gray-700',
        'dark:prose-td:border-gray-700 dark:[&_tr:nth-child(even)_td]:bg-gray-800/50',
        'dark:prose-blockquote:bg-gray-800/30 dark:prose-blockquote:text-gray-400',
        'dark:prose-hr:border-gray-700',

        // Line clamp (feed cards)
        clampLines > 0 && `line-clamp-${clampLines}`,

        className,
      )}
      // Content is admin-authored or Tiptap-sanitized HTML
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
