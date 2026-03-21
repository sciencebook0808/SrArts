import { FloatingNavbar } from '@/components/floating-navbar';
import { HeroSection } from '@/components/hero-section';
import { getFeaturedArtworks, getBlogPosts } from '@/lib/appwrite-server';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export const revalidate = 60; // ISR every 60s

export default async function Home() {
  const [artworks, blogPosts] = await Promise.all([
    getFeaturedArtworks(),
    getBlogPosts(true).then(posts => posts.slice(0, 3)),
  ]);

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />
      <HeroSection />

      {/* Featured Gallery ──────────────────────────────────────────────── */}
      {artworks.length > 0 && (
        <section id="gallery" className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A curated selection of original artwork — each piece crafted with precision and passion.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <Link key={artwork.$id} href={`/gallery/${artwork.$id}`} className="group">
                  <div className="card-base overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative w-full aspect-[4/3] bg-accent-subtle overflow-hidden">
                      {artwork.imageUrl ? (
                        <Image
                          src={String(artwork.imageUrl)}
                          alt={String(artwork.title)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">{String(artwork.category ?? '')}</p>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{String(artwork.title)}</h3>
                      <span className="text-sm text-primary font-medium group-hover:gap-3 transition-all inline-flex items-center gap-1.5">
                        View Artwork <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/gallery"
                className="btn-base border-2 border-primary text-primary px-8 py-3 rounded-full hover:bg-accent-subtle inline-block font-semibold transition-all">
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 px-4 md:px-8 bg-accent-subtle/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">About SR Arts</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            With over a decade of experience in creating stunning artwork, SR Arts specialises in bringing imagination to life.
            Each piece is crafted with meticulous attention to detail and a passion for excellence.
          </p>
          <div className="flex gap-10 justify-center flex-wrap">
            {[
              { value: '500+', label: 'Artworks Created' },
              { value: '1000+', label: 'Happy Clients' },
              { value: '50K+', label: 'Instagram Followers' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-extrabold text-primary mb-1">{stat.value}</div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blog Posts ──────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">From the Blog</h2>
              <p className="text-muted-foreground text-lg">Insights, tutorials, and behind-the-scenes stories.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map(post => (
                <Link key={post.$id} href={`/blog/${post.$id}`} className="group">
                  <div className="card-base overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    {post.coverImage && (
                      <div className="relative w-full aspect-video bg-accent-subtle overflow-hidden">
                        <Image src={String(post.coverImage)} alt={String(post.title)} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 33vw" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      {post.category && <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-2">{String(post.category)}</p>}
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{String(post.title)}</h3>
                      {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{String(post.excerpt)}</p>}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(String(post.$createdAt)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/blog" className="btn-base border-2 border-primary text-primary px-8 py-3 rounded-full hover:bg-accent-subtle inline-block font-semibold transition-all">
                Read All Posts
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Commission CTA ─────────────────────────────────────────────────── */}
      <section id="commission" className="py-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12 border border-white/60"
          style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', boxShadow: '0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
          <h2 className="text-4xl font-bold mb-4">Ready to Commission?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Let's create something extraordinary together. Send your details and we'll respond within 24 hours.
          </p>
          <Link href="/commission"
            className="btn-base bg-primary text-white px-10 py-4 rounded-full hover:bg-primary-light inline-block font-semibold text-lg shadow-md hover:shadow-lg transition-all">
            Start Your Commission
          </Link>
        </div>
      </section>

      {/* Footer ─────────────────────────────────────────────────────────── */}
      <footer id="contact" className="py-14 px-4 md:px-8 border-t border-border bg-accent-subtle/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-extrabold text-xl mb-3 gradient-text">SR Arts</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Premium artistic experience with custom commissions and original artwork.</p>
            </div>
            {[
              { heading: 'Gallery', links: [{ label: 'All Works', href: '/gallery' }] },
              { heading: 'Company', links: [{ label: 'About', href: '/#about' }, { label: 'Blog', href: '/blog' }, { label: 'Commission', href: '/commission' }] },
              { heading: 'Follow', links: [{ label: 'Instagram', href: 'https://instagram.com' }, { label: 'Twitter', href: 'https://twitter.com' }] },
            ].map(col => (
              <div key={col.heading}>
                <h4 className="font-bold text-sm mb-3">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l.href}><a href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SR Arts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
