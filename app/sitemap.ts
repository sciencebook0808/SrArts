import type { MetadataRoute } from 'next';
import { getArtworks, getBlogPosts } from '@/lib/db-server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';

/**
 * Dynamic sitemap — Next.js serves this at /sitemap.xml
 * Fetches all published artworks and blog posts from CockroachDB so every
 * new page the admin creates is immediately discoverable by Google/Bing.
 *
 * Revalidates every 60 seconds (ISR) so search engines always see fresh URLs.
 */
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                      lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/gallery`,         lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/blog`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/about`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/commission`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  // Dynamic artwork pages — each gets its own sitemap entry with the real updatedAt
  let artworkPages: MetadataRoute.Sitemap = [];
  try {
    const artworks = await getArtworks(true);
    artworkPages = artworks.map(a => ({
      url:             `${BASE_URL}/gallery/${a.slug}`,
      lastModified:    a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority:        0.7,
    }));
  } catch { /* DB not ready yet — skip gracefully */ }

  // Dynamic blog post pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts(true);
    blogPages = posts.map(p => ({
      url:             `${BASE_URL}/blog/${p.slug}`,
      lastModified:    p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority:        0.65,
    }));
  } catch { /* DB not ready yet — skip gracefully */ }

  return [...staticPages, ...artworkPages, ...blogPages];
}
