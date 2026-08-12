import 'server-only';
/**
 * lib/html-sanitizer.ts — Server-only rich-text HTML sanitizer.
 *
 * WHY THIS EXISTS
 *  Community posts are authored by any signed-in user through the TipTap
 *  UnifiedEditor and stored as raw HTML. That HTML is rendered with
 *  `dangerouslySetInnerHTML` (components/prose-content.tsx and
 *  components/community/post-detail.tsx). Before this module existed, nothing
 *  stripped `<script>`, `on*=` handlers or `javascript:` URLs on the way in,
 *  which made `POST /api/community` a stored-XSS vector against every visitor
 *  — including admins browsing the feed.
 *
 *  The site CSP allows `'unsafe-inline'` for scripts (Clerk + next/script need
 *  it), so CSP does NOT mitigate this. Sanitization is the actual control.
 *
 * STRATEGY — allowlist, applied twice
 *  1. ON WRITE  — every user-authored rich-text field is sanitized before it
 *     reaches the database (see lib/db-server.ts community writers).
 *  2. ON READ   — community post content is sanitized again when loaded, so
 *     rows written before this module shipped are neutralised too, without a
 *     destructive data migration.
 *
 *  `server-only` keeps sanitize-html (and htmlparser2) out of the client
 *  bundle — the sanitizer runs in route handlers and server components only.
 *
 * The allowlist covers exactly what the TipTap extension set can emit
 * (see components/editor/config/extensions.ts): headings, lists, task lists,
 * tables, images/figures, code blocks, marks, alignment and YouTube embeds.
 */

import sanitizeHtml from 'sanitize-html';

/** Hosts permitted as <iframe> sources — matches `frame-src` in next.config.mjs */
const ALLOWED_IFRAME_HOSTNAMES = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
];

/**
 * CSS properties we allow through inline `style` attributes.
 * The editor sets colour, background colour, font family/size, line height and
 * alignment inline. Anything else (position, behavior, expression, url(), …)
 * is dropped by sanitize-html because it is not listed here.
 */
const ALLOWED_STYLES: sanitizeHtml.IOptions['allowedStyles'] = {
  '*': {
    'color':            [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^hsla?\([\d\s.,%]+\)$/i, /^oklch\([\d\s.,%/]+\)$/i, /^[a-z]+$/i],
    'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^hsla?\([\d\s.,%]+\)$/i, /^oklch\([\d\s.,%/]+\)$/i, /^[a-z]+$/i],
    'font-family':      [/^[\w\s,'"-]+$/],
    'font-size':        [/^\d+(\.\d+)?(px|em|rem|pt|%)$/],
    'line-height':      [/^\d+(\.\d+)?(px|em|rem|%)?$/],
    'text-align':       [/^(left|right|center|justify)$/],
    'width':            [/^\d+(\.\d+)?(px|em|rem|%)$/],
    'max-width':        [/^\d+(\.\d+)?(px|em|rem|%)$/],
  },
};

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    // Block
    'p', 'div', 'br', 'hr', 'blockquote', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists (incl. TipTap task lists)
    'ul', 'ol', 'li', 'label', 'input',
    // Inline marks
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins',
    'code', 'span', 'mark', 'sub', 'sup', 'small', 'a',
    // Media
    'img', 'figure', 'figcaption', 'iframe',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
  ],

  allowedAttributes: {
    '*':      ['style', 'class', 'data-type', 'data-align', 'dir'],
    a:        ['href', 'target', 'rel', 'title'],
    img:      ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe:   ['src', 'width', 'height', 'allow', 'allowfullscreen', 'title', 'frameborder'],
    // TipTap TaskItem renders a real checkbox
    input:    ['type', 'checked', 'disabled'],
    li:       ['data-checked', 'data-type'],
    ul:       ['data-type'],
    table:    ['style'],
    th:       ['colspan', 'rowspan', 'colwidth', 'style'],
    td:       ['colspan', 'rowspan', 'colwidth', 'style'],
    col:      ['style', 'width'],
    figure:   ['data-type'],
  },

  allowedStyles: ALLOWED_STYLES,

  // Only these URL schemes survive; `javascript:`, `data:` (except images
  // below) and `vbscript:` are stripped entirely.
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    // data: images are allowed so pasted/inlined editor images keep working.
    img: ['http', 'https', 'data'],
  },
  allowProtocolRelative: false,

  // Drop the contents (not just the tags) of anything executable or
  // namespace-confusing — this is what closes mXSS style bypasses.
  nonTextTags: ['script', 'style', 'textarea', 'noscript', 'template', 'title', 'xmp'],

  // Force safe rel on every outbound link.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.href ? { target: '_blank', rel: 'nofollow noopener noreferrer ugc' } : {}),
      },
    }),
    // Checkboxes in rendered (non-editor) content must never be submittable.
    input: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, type: 'checkbox', disabled: 'disabled' },
    }),
  },

  // Any iframe whose src is not a YouTube embed is removed.
  allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
  allowIframeRelativeUrls: false,

  parser: {
    lowerCaseTags:           true,
    lowerCaseAttributeNames: true,
    recognizeSelfClosing:    true,
  },
};

/** Hard cap so a single post can never blow up the DB row or the renderer. */
export const MAX_RICH_HTML_LENGTH = 50_000;

/**
 * Sanitize user-authored rich-text HTML.
 *
 * Safe to call on already-sanitized input (idempotent) and on plain text —
 * plain text passes through with only HTML-special characters encoded.
 *
 * @param raw   Untrusted HTML from the editor or the database
 * @param limit Maximum output length (defaults to MAX_RICH_HTML_LENGTH)
 */
export function sanitizeRichHtml(raw: string, limit = MAX_RICH_HTML_LENGTH): string {
  if (!raw) return '';
  return sanitizeHtml(raw, OPTIONS).slice(0, limit);
}

/**
 * Strip ALL markup and return plain text — used for excerpts, meta
 * descriptions and slug generation where markup must never leak through.
 */
export function htmlToPlainText(raw: string, limit = 5_000): string {
  if (!raw) return '';
  return sanitizeHtml(raw, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}
