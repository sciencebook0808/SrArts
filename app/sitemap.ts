import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sr-arts.com';
  const lastModified = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/commission`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Sample artwork pages (in production, fetch from Appwrite)
  const artworkPages: MetadataRoute.Sitemap = Array.from({ length: 10 }, (_, i) => ({
    url: `${baseUrl}/gallery/${i + 1}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Sample blog pages (in production, fetch from Appwrite)
  const blogPages: MetadataRoute.Sitemap = Array.from({ length: 5 }, (_, i) => ({
    url: `${baseUrl}/blog/${i + 1}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...artworkPages, ...blogPages];
}
