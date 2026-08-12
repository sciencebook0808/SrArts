/**
 * app/(public)/not-found.tsx
 *
 * SOFT-404 FIX: `notFound()` calls inside this route group (gallery/[slug],
 * blog/[slug], community/[slug], [username]) rendered the root
 * app/not-found.tsx UI but responded with HTTP 200 — a "soft 404". Search
 * engines treat a 200 as a real page, so every mistyped or deleted URL was
 * indexable as valid content.
 *
 * Next.js resolves `not-found.tsx` against the nearest segment boundary. This
 * group has its own layout (app/(public)/layout.tsx), so it needs its own
 * not-found boundary for the 404 status to be emitted correctly.
 *
 * The UI itself is shared with the root boundary — see components/not-found-view.
 */
export { metadata, default } from '@/app/not-found';
