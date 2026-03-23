import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { FloatingNavbar } from '@/components/floating-navbar';
import { UniversalRepostClient } from '@/components/community/universal-repost-client';
import {
  getArtworkBySlug,
  getArtwork,
  getBlogPostBySlug,
  getBlogPost,
  getCommunityPost,
} from '@/lib/db-server';

interface Props {
  params: Promise<{ type: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, id } = await params;

  let title = 'Repost';
  if (type === 'artwork') {
    const artwork = await getArtwork(id) ?? await getArtworkBySlug(id);
    title = artwork?.title ?? 'Repost Artwork';
  } else if (type === 'blog') {
    const post = await getBlogPost(id) ?? await getBlogPostBySlug(id);
    title = post?.title ?? 'Repost Blog';
  } else if (type === 'post') {
    const post = await getCommunityPost(id);
    title = post ? `Repost from ${post.authorName}` : 'Repost';
  }

  return {
    title: `${title} | SR Arts Community`,
    robots: { index: false, follow: false },
  };
}

export default async function RepostPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { type, id } = await params;

  if (!['artwork', 'blog', 'post'].includes(type)) notFound();

  let referenceData: {
    type:    'artwork' | 'blog' | 'post';
    id:      string;
    title:   string;
    image:   string | null;
    slug:    string;
    excerpt: string | null;
    author?: string;
  } | null = null;

  if (type === 'artwork') {
    const artwork = await getArtwork(id) ?? await getArtworkBySlug(id);
    if (!artwork || artwork.status !== 'published') notFound();
    referenceData = {
      type:    'artwork',
      id:      artwork.id,
      title:   artwork.title,
      image:   artwork.imageUrl || null,
      slug:    artwork.slug,
      excerpt: artwork.description ?? null,
    };
  } else if (type === 'blog') {
    const post = await getBlogPost(id) ?? await getBlogPostBySlug(id);
    if (!post || post.status !== 'published') notFound();
    referenceData = {
      type:    'blog',
      id:      post.id,
      title:   post.title,
      image:   post.coverImage ?? null,
      slug:    post.slug,
      excerpt: post.excerpt ?? null,
      author:  post.author,
    };
  } else if (type === 'post') {
    const post = await getCommunityPost(id);
    if (!post) notFound();
    referenceData = {
      type:    'post',
      id:      post.id,
      title:   `Post by ${post.authorName}`,
      image:   post.imageUrl ?? null,
      slug:    post.slug ?? post.id,
      excerpt: post.content.replace(/<[^>]*>/g, '').slice(0, 200) ?? null,
      author:  post.authorName,
    };
  }

  if (!referenceData) notFound();

  return (
    <main className="w-full min-h-screen bg-[#f4f2ef]">
      <FloatingNavbar />
      <div className="pt-24 md:pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <UniversalRepostClient reference={referenceData} />
        </div>
      </div>
    </main>
  );
}
