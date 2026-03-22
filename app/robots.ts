import type { MetadataRoute } from 'next';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*',       allow: '/', disallow: ['/admin', '/api/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/admin', '/api/'] },
      { userAgent: 'Bingbot',   allow: '/', disallow: ['/admin', '/api/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
