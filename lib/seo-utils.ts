import { Metadata } from 'next';

interface SEOMetadataProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  author?: string;
  publishedDate?: string;
  updatedDate?: string;
  tags?: string[];
  type?: 'article' | 'website' | 'image';
}

export function generateSEOMetadata(props: SEOMetadataProps): Metadata {
  const {
    title,
    description,
    image,
    url = 'https://sr-arts.com',
    author = 'SR Arts',
    publishedDate,
    updatedDate,
    tags = [],
    type = 'website',
  } = props;

  const fullTitle = `${title} | SR Arts`;
  const canonical = url;

  return {
    title: fullTitle,
    description,
    keywords: [
      'art',
      'artist',
      'portfolio',
      'commission',
      'artwork',
      'digital art',
      'anime art',
      ...tags,
    ],
    authors: [{ name: author }],
    creator: author,
    publisher: 'SR Arts',
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      url: canonical,
      title: fullTitle,
      description,
      siteName: 'SR Arts',
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
      ...(publishedDate && { publishedTime: publishedDate }),
      ...(updatedDate && { modifiedTime: updatedDate }),
      ...(type === 'article' && {
        authors: [author],
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
      creator: '@sr_arts',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: {
      canonical,
    },
  };
}

export function generateStructuredData(props: {
  type: 'artwork' | 'blogpost' | 'person' | 'organization';
  name: string;
  description?: string;
  image?: string;
  url?: string;
  author?: string;
  publishedDate?: string;
  createdDate?: string;
}) {
  const baseUrl = 'https://sr-arts.com';

  switch (props.type) {
    case 'artwork':
      return {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: props.name,
        description: props.description,
        image: props.image,
        url: props.url || baseUrl,
        creator: {
          '@type': 'Person',
          name: props.author || 'SR Arts',
        },
        dateCreated: props.createdDate,
      };

    case 'blogpost':
      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: props.name,
        description: props.description,
        image: props.image,
        datePublished: props.publishedDate,
        dateModified: props.publishedDate,
        author: {
          '@type': 'Person',
          name: props.author || 'SR Arts',
        },
      };

    case 'person':
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: props.name,
        url: props.url || baseUrl,
        image: props.image,
        description: props.description,
        sameAs: [
          'https://instagram.com/sr_arts',
          'https://twitter.com/sr_arts',
        ],
      };

    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: props.name,
        url: props.url || baseUrl,
        logo: props.image,
        description: props.description,
        sameAs: [
          'https://instagram.com/sr_arts',
          'https://twitter.com/sr_arts',
        ],
        contact: {
          '@type': 'ContactPoint',
          telephone: '+1-555-123-4567',
          contactType: 'Customer Service',
        },
      };

    default:
      return null;
  }
}

export const siteConfig = {
  name: 'SR Arts',
  description: 'Premium artist portfolio with custom commissions, gallery, and blog',
  url: 'https://sr-arts.com',
  ogImage: 'https://sr-arts.com/og-image.jpg',
  links: {
    instagram: 'https://instagram.com/sr_arts',
    twitter: 'https://twitter.com/sr_arts',
  },
};
