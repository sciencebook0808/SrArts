import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { FloatingNavbar } from '@/components/floating-navbar';
import { HeroSection } from '@/components/hero-section';
import { AdSlot } from '@/components/ad-slot';
import { SectionsAnimator } from '@/components/sections-animator';
import { getFeaturedArtworks, getBlogPosts, getPublicStats } from '@/lib/db-server';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'SR Arts Official — Premium Artist Portfolio',
  description:
    'Explore stunning original artwork by Anubhav Yadav. Commission custom pieces and connect with a community of art lovers.',
};

export default async function Home() {
  const [artworks, blogPosts, stats] = await Promise.all([
    getFeaturedArtworks(),
    getBlogPosts(true).then(p => p.slice(0, 3)),
    getPublicStats(),
  ]);

  return (
    <main className="w-full min-h-screen bg-white overflow-x-hidden">
      <FloatingNavbar />

      {/* ── Hero — canvas brush intro + Three.js ─────────────────────────── */}
      <HeroSection stats={stats} />

      {/*
       * SectionsAnimator: a client component that sets up GSAP ScrollTrigger
       * for all [data-reveal] and [data-stagger] elements below the fold.
       * Wrap everything below hero in this single client boundary.
       */}
      <SectionsAnimator>

        {/* ── Featured Artworks ──────────────────────────────────────────── */}
        {artworks.length > 0 && (
          <section id="gallery" className="py-24 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

              <div className="text-center mb-16" data-reveal="fadeBlur">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Portfolio</p>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Featured Works</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  A curated selection of original artwork — each piece crafted with precision and passion.
                </p>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                data-stagger="0.07"
                data-stagger-preset="fadeUp"
              >
                {artworks.map((artwork, i) => (
                  <Link key={artwork.id} href={`/gallery/${artwork.slug}`} className="group block">
                    <div className="card-base overflow-hidden">
                      <div className="relative w-full aspect-[4/3] bg-accent-subtle overflow-hidden">
                        {artwork.imageUrl ? (
                          <Image
                            src={artwork.imageUrl} alt={artwork.title} fill
                            className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading={i < 2 ? 'eager' : 'lazy'}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {artwork.featured && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        {artwork.category && (
                          <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">{artwork.category}</p>
                        )}
                        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-1">
                          {artwork.title}
                        </h3>
                        <span className="text-sm text-primary font-medium inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                          View Artwork <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-12" data-reveal="fadeUp" data-reveal-delay="0.2">
                <Link
                  href="/gallery"
                  className="btn-base border-2 border-primary text-primary px-8 py-3.5 rounded-full hover:bg-accent-subtle font-semibold inline-flex items-center gap-2 group"
                >
                  View Full Gallery
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Ad slot ─────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex justify-center">
          <AdSlot slot="home-between-sections" format="leaderboard" />
        </div>

        {/* ── About section ───────────────────────────────────────────────── */}
        <section id="about" className="py-24 px-4 md:px-8 bg-accent-subtle/40">
          <div className="max-w-4xl mx-auto text-center">
            <div data-reveal="fadeBlur">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">The Artist</p>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8">About SR Arts Official</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                With over a decade of experience, SR Arts specialises in bringing imagination to life.
                Each piece is crafted with meticulous attention to detail and a passion for excellence.
              </p>
            </div>

            {/* Stats from DB — animated counters */}
            <div
              className="flex gap-10 justify-center flex-wrap mb-10"
              data-stagger="0.10"
              data-stagger-preset="scale"
            >
              {[
                { value: stats.artworks,  label: 'Artworks Created' },
                { value: stats.clients,   label: 'Happy Clients' },
                { value: stats.followers, label: 'Social Followers' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-4xl font-extrabold gradient-text mb-1">{s.value}</div>
                  <p className="text-muted-foreground text-sm font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            <div data-reveal="fadeUp" data-reveal-delay="0.3">
              <Link
                href="/about"
                className="btn-base border-2 border-primary text-primary px-8 py-3.5 rounded-full hover:bg-accent-subtle font-semibold inline-flex items-center gap-2 group"
              >
                Meet the Artist
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Community teaser ────────────────────────────────────────────── */}
        <section className="py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div data-reveal="slideLeft">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Community
                </p>
                <h2 className="text-4xl font-extrabold mb-5 leading-tight">
                  Connect with Art Lovers Worldwide
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Share your thoughts, discover new artists, repost inspiring work, and engage with a growing
                  community of creators and collectors — all in one place.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/community"
                    className="btn-base bg-primary text-white px-7 py-3.5 rounded-full hover:bg-primary-light font-semibold shadow-md hover:shadow-lg hover:shadow-primary/25 inline-flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" /> Join Community
                  </Link>
                  <Link
                    href="/gallery"
                    className="btn-base border-2 border-border text-foreground/70 px-7 py-3.5 rounded-full hover:border-primary hover:text-primary font-semibold inline-flex items-center gap-2"
                  >
                    Browse Gallery
                  </Link>
                </div>
              </div>

              <div
                className="grid grid-cols-2 gap-4"
                data-stagger="0.08"
                data-stagger-preset="scale"
              >
                {['Like & react to posts', 'Repost with your thoughts', 'Comment & connect', 'Share artwork discoveries'].map((feat, i) => (
                  <div
                    key={feat}
                    className="p-4 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold text-sm">{i + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground/80">{feat}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Blog section ──────────────────────────────────────────────────── */}
        {blogPosts.length > 0 && (
          <section className="py-24 px-4 md:px-8 bg-accent-subtle/30">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14" data-reveal="fadeBlur">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Journal</p>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">From the Studio</h2>
                <p className="text-muted-foreground text-lg">Insights, tutorials, and behind-the-scenes stories.</p>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                data-stagger="0.09"
                data-stagger-preset="fadeUp"
              >
                {blogPosts.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <div className="card-base overflow-hidden h-full flex flex-col">
                      {post.coverImage && (
                        <div className="relative w-full aspect-video bg-accent-subtle overflow-hidden">
                          <Image
                            src={post.coverImage} alt={post.title} fill
                            className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        {post.category && (
                          <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-2">{post.category}</p>
                        )}
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-10" data-reveal="fadeUp" data-reveal-delay="0.2">
                <Link
                  href="/blog"
                  className="btn-base border-2 border-primary text-primary px-8 py-3.5 rounded-full hover:bg-accent-subtle font-semibold inline-flex items-center gap-2 group"
                >
                  Read All Posts
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Commission CTA ──────────────────────────────────────────────── */}
        <section id="commission" className="py-24 px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12 shadow-xl" data-reveal="scale">
            <h2 className="text-4xl font-extrabold mb-4">Ready to Commission?</h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Let's create something extraordinary together. Fill out a brief and we'll respond within 24 hours.
            </p>
            <Link
              href="/commission"
              className="btn-base bg-primary text-white px-10 py-4 rounded-full hover:bg-primary-light font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/25 inline-flex items-center gap-2"
            >
              Start Your Commission
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer id="contact" className="py-14 px-4 md:px-8 border-t border-border bg-accent-subtle/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1">
                <h3 className="font-extrabold text-xl mb-3 gradient-text">SR Arts Official</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Premium artistic experiences with original artworks, custom commissions, and a creative community.
                </p>
              </div>
              {[
                { heading: 'Gallery',  links: [{ label: 'All Works',  href: '/gallery'     }, { label: 'Commission', href: '/commission' }] },
                { heading: 'Company',  links: [{ label: 'About',      href: '/about'        }, { label: 'Blog',       href: '/blog'       }, { label: 'Community', href: '/community' }] },
                { heading: 'Connect',  links: [{ label: 'Instagram',  href: 'https://instagram.com' }, { label: 'Twitter', href: 'https://twitter.com' }] },
                { heading: 'Legal',    links: [{ label: 'Terms',      href: '/terms'        }, { label: 'Privacy',    href: '/privacy'    }] },
              ].map(col => (
                <div key={col.heading}>
                  <h4 className="font-bold text-sm mb-3">{col.heading}</h4>
                  <ul className="space-y-2">
                    {col.links.map(l => (
                      <li key={l.href}>
                        <a href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-border text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} SR Arts Official. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Made with{' '}
                <span className="text-red-500" aria-label="love">❤️</span>
                {' '}by{' '}
                <span className="font-semibold text-foreground/70">FBADevDev</span>
                {' '}(Ishant Solutions)
              </p>
            </div>
          </div>
        </footer>

      </SectionsAnimator>
    </main>
  );
}
