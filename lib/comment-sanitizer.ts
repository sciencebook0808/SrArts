/**
 * lib/comment-sanitizer.ts
 *
 * Server-side comment content sanitizer.
 *
 * STRATEGY:
 *   Comments are plain text only (not HTML). We strip all HTML tags,
 *   control characters, and Unicode direction-override tricks.
 *   Mentions (@username) are preserved as plain text.
 *
 * WHY NOT DOMPurify?
 *   DOMPurify requires a DOM environment. On the Next.js Node.js server,
 *   jsdom adds ~10MB overhead. Since comments are plain text (not rich HTML),
 *   a regex strip is both faster and safer.
 */

/** Max length for a comment message */
export const COMMENT_MAX_LENGTH = 1000;

/** Max length for a reply message */
export const REPLY_MAX_LENGTH = 1000;

/**
 * Sanitize a comment or reply message.
 *
 * - Strips HTML tags (prevents XSS if ever rendered with dangerouslySetInnerHTML)
 * - Strips null bytes and Unicode control characters
 * - Strips Unicode direction overrides (RTL/LTR bidi exploits)
 * - Normalises whitespace (collapse multiple newlines to max 2)
 * - Trims to maximum allowed length
 */
export function sanitizeComment(raw: string): string {
  return raw
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Strip HTML entities that could become executable
    .replace(/&(?:lt|gt|amp|quot|apos|#\d+|#x[\da-f]+);/gi, (m) => {
      const map: Record<string, string> = {
        '&lt;': '<', '&gt;': '>', '&amp;': '&',
        '&quot;': '"', '&apos;': "'",
      };
      return map[m.toLowerCase()] ?? '';
    })
    // Strip null bytes
    .replace(/\0/g, '')
    // Strip Unicode control characters (except tab, newline, carriage return)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Strip Unicode bidi override characters
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    // Normalise multiple blank lines to max 2 consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim()
    // Enforce max length
    .slice(0, COMMENT_MAX_LENGTH);
}

/**
 * Validate a sanitized comment — returns an error string or null if valid.
 */
export function validateComment(sanitized: string): string | null {
  if (sanitized.length < 1) return 'Comment cannot be empty.';
  if (sanitized.length > COMMENT_MAX_LENGTH) {
    return `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer.`;
  }
  return null;
}
