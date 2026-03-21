import { FloatingNavbar } from '@/components/floating-navbar';
import { getBlogPost } from '@/lib/appwrite-server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import type { Metadata } from 'next';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPost(id);
  if (!post) return {};
  return {
    title: String(post.seoTitle ?? post.title),
    description: String(post.seoDescription ?? post.excerpt ?? ''),
    openGraph: post.coverImage ? { images: [{ url: String(post.coverImage) }] } : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getBlogPost(id);
  if (!post || post.status === 'draft') notFound();

  const tags: string[] = Array.isArray(post.tags) ? post.tags.map(String) : [];

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      <article className="pt-24 md:pt-28 px-4 md:px-8 pb-20">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {post.coverImage && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-accent-subtle shadow-lg mb-8">
              <Image src={String(post.coverImage)} alt={String(post.title)} fill
                className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>
          )}

          {post.category && (
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">{String(post.category)}</span>
          )}

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">{String(post.title)}</h1>

          <div className="flex items-center gap-5 text-sm text-muted-foreground mb-10 flex-wrap">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{String(post.author ?? 'SR Arts')}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />
              {new Date(String(post.$createdAt)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Rendered TipTap HTML */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-extrabold prose-a:text-primary prose-img:rounded-xl prose-blockquote:border-primary"
            dangerouslySetInnerHTML={{ __html: String(post.content ?? '') }}
          />

          {tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-border flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-accent-subtle text-sm text-foreground/70 capitalize">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>

      <footer className="py-10 px-4 md:px-8 border-t border-border bg-accent-subtle/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SR Arts. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
