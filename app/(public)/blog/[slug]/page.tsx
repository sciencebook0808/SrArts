import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FloatingNavbar } from '@/components/floating-navbar';
import { CommentsSection } from '@/components/comments-section';
import { getBlogPostBySlug, incrementBlogViews } from '@/lib/db-server';
import { ArrowLeft, Calendar, User, Tag, Repeat2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';

export const revalidate = 300;

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  const title       = post.title;
  const description = (post.seoDescription ?? post.excerpt ?? '').slice(0, 160);
  const canonical   = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: `${post.seoTitle ?? title} | SR Arts`,
    description,
    keywords: ['art', 'digital art', 'SR Arts', ...post.tags],
    authors: [{ name: post.author }],
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: 'SR Arts',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime:  post.updatedAt.toISOString(),
      authors: [post.author],
      tags: post.tags,
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SR Arts`,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== 'published') notFound();

  // Increment view count in background — non-blocking, same pattern as artwork page
  void incrementBlogViews(post.id);

  const canonical = `${BASE_URL}/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: (post.excerpt ?? '').slice(0, 160),
    image: post.coverImage ?? undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified:  post.updatedAt.toISOString(),
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    author: { '@type': 'Person', name: post.author, url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'SR Arts',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon.svg` },
    },
    keywords: post.tags.join(', '),
    inLanguage: 'en-US',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full min-h-screen bg-white">
        <FloatingNavbar />

        <article className="pt-24 md:pt-28 px-4 md:px-8 pb-20">
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            {/* Cover image */}
            {post.coverImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-accent-subtle shadow-lg mb-8">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            )}

            {/* Category */}
            {post.category && (
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">
                {post.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-5 text-sm text-muted-foreground mb-10 flex-wrap">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.createdAt.toISOString()}>
                  {post.createdAt.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </span>
            </div>

            {/* Rich content from TipTap (HTML) */}
            <div
              className="prose prose-lg max-w-none prose-headings:font-extrabold prose-a:text-primary prose-img:rounded-xl prose-blockquote:border-primary prose-iframe:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-border flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-accent-subtle text-sm text-foreground/70 capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share to Community CTA */}
            <div className="mt-8 p-5 bg-accent-subtle/40 rounded-2xl border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div>
                <p className="font-semibold text-sm">Enjoyed this post?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Share it with the SR Arts community and add your thoughts.</p>
              </div>
              <Link
                href={`/community/repost/blog/${post.id}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors shadow-sm whitespace-nowrap shrink-0"
              >
                <Repeat2 className="w-4 h-4" />
                Share to Community
              </Link>
            </div>

            {/* Comments section */}
            <CommentsSection
              targetId={post.id}
              targetType="blog"
              title="Discussion"
            />
          </div>
        </article>

        <footer className="py-10 px-4 md:px-8 border-t border-border bg-accent-subtle/20">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SR Arts. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
