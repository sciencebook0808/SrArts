import { FloatingNavbar } from '@/components/floating-navbar';
import { getBlogPosts } from '@/lib/db-server';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import type { Metadata } from 'next';
export const revalidate = 30;
export const metadata: Metadata = { title: 'Blog | SR Arts', description: 'Insights, tutorials, and behind-the-scenes stories from the SR Arts studio.' };

export default async function BlogPage() {
  const posts = await getBlogPosts(true);
  const featured = posts.find(p => p.featured);
  const rest = posts.filter(p => p.id !== featured?.id);
  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />
      <section className="pt-28 md:pt-32 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">Insights, tutorials, and behind-the-scenes from the studio.</p>
        </div>
      </section>
      <section className="px-4 md:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-24"><p className="text-muted-foreground text-lg">No posts published yet. Check back soon.</p></div>
          ) : (
            <>
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group block mb-12">
                  <div className="card-base overflow-hidden hover:shadow-2xl transition-all duration-300 md:flex">
                    {featured.coverImage && (
                      <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto md:min-h-[320px] bg-accent-subtle overflow-hidden">
                        <Image src={featured.coverImage} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" priority />
                      </div>
                    )}
                    <div className="p-8 md:w-1/2 flex flex-col justify-center">
                      <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Featured Post</span>
                      {featured.category && <p className="text-sm text-muted-foreground mb-2 capitalize">{featured.category}</p>}
                      <h2 className="text-2xl md:text-3xl font-extrabold mb-4 group-hover:text-primary transition-colors">{featured.title}</h2>
                      {featured.excerpt && <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{featured.author}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{featured.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                      <div className="card-base overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                        {post.coverImage && <div className="relative w-full aspect-video bg-accent-subtle overflow-hidden"><Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" /></div>}
                        <div className="p-5 flex flex-col flex-1">
                          {post.category && <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-2">{post.category}</p>}
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">{post.title}</h3>
                          {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{post.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <footer className="py-10 px-4 md:px-8 border-t border-border bg-accent-subtle/20">
        <div className="max-w-6xl mx-auto text-center"><p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SR Arts. All rights reserved.</p></div>
      </footer>
    </main>
  );
}
