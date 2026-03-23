/**
 * app/[username]/community/[slug]/page.tsx
 *
 * Individual community post viewed under its author's profile.
 * URL: /[username]/community/[slug]
 *
 * Canonical URL is /community/[slug] — this page renders the same content
 * but with the user-scoped URL shown in the browser, matching the user's
 * mental model of "this post belongs to this person".
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { getCommunityPost } from '@/lib/db-server';
import { FloatingNavbar } from '@/components/floating-navbar';
import { CommunityPostDetail } from '@/components/community/post-detail';

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;

  try {
    const post = await getCommunityPost(slug);
    if (!post) return { title: 'Post not found | SR Arts' };

    const excerpt = post.content.slice(0, 120).replace(/\s+/g, ' ');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';

    return {
      title: `@${username} on SR Arts`,
      description: excerpt,
      alternates: {
        canonical: `${siteUrl}/community/${slug}`,
      },
      openGraph: {
        title: `@${username} on SR Arts`,
        description: excerpt,
        url: `${siteUrl}/${username}/community/${slug}`,
        images: post.imageUrl ? [{ url: post.imageUrl }] : [],
      },
      twitter: {
        card: post.imageUrl ? 'summary_large_image' : 'summary',
        title: `@${username} on SR Arts`,
        description: excerpt,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    };
  } catch {
    return { title: 'Post | SR Arts' };
  }
}

export default async function UserCommunityPostPage({ params }: Props) {
  const { username, slug } = await params;

  // Verify post exists
  const post = await getCommunityPost(slug);
  if (!post) notFound();

  // Verify the username matches the post author (security + correctness)
  let authorUsername: string | null = null;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(post.authorId).catch(() => null);
    authorUsername = user?.username ?? null;
  } catch { /* non-critical */ }

  // If username in URL doesn't match actual author, return 404
  if (authorUsername && authorUsername !== username) notFound();

  return (
    <main className="w-full min-h-screen bg-[#f4f2ef]">
      <FloatingNavbar />
      <div className="pt-28 pb-20 px-4 md:px-6 max-w-2xl mx-auto">
        <CommunityPostDetail post={post} backHref={`/${username}`} />
      </div>
    </main>
  );
}
