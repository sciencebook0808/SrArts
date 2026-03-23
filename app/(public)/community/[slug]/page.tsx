/**
 * app/community/[slug]/page.tsx
 *
 * Canonical individual community post page.
 * URL: /community/[slug]
 *
 * - Full post with all comments loaded
 * - Share / like / repost actions
 * - Author card linking back to /[username]
 * - SEO: OpenGraph + Twitter cards
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getCommunityPost } from '@/lib/db-server';
import { FloatingNavbar } from '@/components/floating-navbar';
import { CommunityPostDetail } from '@/components/community/post-detail';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getCommunityPost(slug);
    if (!post) return { title: 'Post not found | SR Arts' };

    const excerpt = post.content.replace(/<[^>]*>/g, '').slice(0, 160).replace(/\s+/g, ' ').trim();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';
    const canonical = `${siteUrl}/community/${slug}`;

    return {
      title: `${post.authorName} on SR Arts Community`,
      description: excerpt,
      alternates: { canonical },
      openGraph: {
        title: `${post.authorName} on SR Arts Community`,
        description: excerpt,
        url: canonical,
        type: 'article',
        images: post.imageUrl
          ? [{ url: post.imageUrl, width: 1200, height: 630 }]
          : [{ url: `${siteUrl}/android-chrome-512x512.png` }],
        publishedTime: post.createdAt.toISOString(),
        authors: [post.authorName],
      },
      twitter: {
        card: post.imageUrl ? 'summary_large_image' : 'summary',
        title: `${post.authorName} on SR Arts`,
        description: excerpt,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    };
  } catch {
    return { title: 'Community Post | SR Arts' };
  }
}

export default async function CommunityPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await getCommunityPost(slug);
  if (!post) notFound();

  // Look up author username for the back-link
  let authorUsername: string | null = null;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(post.authorId).catch(() => null);
    authorUsername = user?.username ?? null;
  } catch { /* non-critical */ }

  return (
    <main className="w-full min-h-screen bg-[#f4f2ef]">
      <FloatingNavbar />
      <div className="pt-28 pb-20 px-4 md:px-6 max-w-2xl mx-auto">
        <CommunityPostDetail
          post={post}
          backHref={authorUsername ? `/${authorUsername}` : '/community'}
        />
      </div>
    </main>
  );
}
