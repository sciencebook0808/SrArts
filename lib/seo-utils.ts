/**
 * lib/seo-utils.ts — Shared SEO helper utilities
 */

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '…';
}

export function buildOpenGraphImages(imageUrl: string | null | undefined, alt: string) {
  if (!imageUrl) return undefined;
  return [{ url: imageUrl, width: 1200, height: 630, alt }];
}

export function buildCanonical(base: string, path: string): string {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
