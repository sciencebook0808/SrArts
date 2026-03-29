import type { Metadata } from 'next';
import { notFound }      from 'next/navigation';
import Image             from 'next/image';
import Link              from 'next/link';
import { FloatingNavbar }      from '@/components/floating-navbar';
import { ArtworkLikeButton }   from '@/components/artwork-like-button';
import { CommentsSection }     from '@/components/comments-section';
import { getArtworkBySlug, incrementArtworkViews } from '@/lib/db-server';
import { ArrowLeft, Eye, Repeat2 }      from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';

/** Inline Instagram SVG — lucide-react 0.5+ removed brand icons */
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

// ISR: cache for 5 minutes, revalidate in background
export const revalidate = 300;

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug }  = await params;
  const artwork   = await getArtworkBySlug(slug);
  if (!artwork)   return { title: 'Artwork Not Found' };

  const title       = artwork.title;
  const description = (artwork.description ?? `Artwork by SR Arts: ${title}`).slice(0, 160);
  const canonical   = `${BASE_URL}/gallery/${artwork.slug}`;

  return {
    title:       `${title} | SR Arts Gallery`,
    description,
    alternates:  { canonical },
    openGraph: {
      type:      'website',
      url:       canonical,
      title:     `${title} | SR Arts Gallery`,
      description,
      siteName:  'SR Arts',
      images:    artwork.imageUrl
        ? [{ url: artwork.imageUrl, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${title} | SR Arts Gallery`,
      description,
      images:      artwork.imageUrl ? [artwork.imageUrl] : undefined,
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const { slug }  = await params;
  const artwork   = await getArtworkBySlug(slug);
  if (!artwork || artwork.status !== 'published') notFound();

  void incrementArtworkViews(artwork.id);

  const canonical = `${BASE_URL}/gallery/${artwork.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'VisualArtwork',
    name:        artwork.title,
    description: (artwork.description ?? '').slice(0, 500),
    image:       artwork.imageUrl ?? undefined,
    url:         canonical,
    artform:     artwork.category ?? 'Digital Art',
    dateCreated: artwork.createdAt.toISOString(),
    creator:     { '@type': 'Person', name: 'SR Arts', url: BASE_URL },
    offers:      artwork.price ? {
      '@type':         'Offer',
      price:           artwork.price,
      priceCurrency:   'USD',
      availability:    'https://schema.org/InStock',
      url:             `${BASE_URL}/commission`,
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="w-full min-h-screen bg-white">
        <FloatingNavbar />
        <div className="pt-24 md:pt-28 px-4 md:px-8 pb-20">
          <div className="max-w-5xl mx-auto">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-accent-subtle shadow-lg">
                {artwork.imageUrl ? (
                  <Image src={artwork.imageUrl} alt={artwork.title} fill
                    className="object-cover" sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    quality={85} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {artwork.category && (
                  <span className="text-xs font-bold text-primary uppercase tracking-widest block">
                    {artwork.category}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{artwork.title}</h1>
                {artwork.description && (
                  <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {artwork.views} views
                  </span>
                  {artwork.price && (
                    <span className="text-primary font-bold text-lg">
                      ${artwork.price.toLocaleString()}
                    </span>
                  )}
                </div>

                <ArtworkLikeButton artworkId={artwork.id} initialCount={artwork.likes} />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/commission"
                    className="flex-1 text-center py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors shadow-sm">
                    Commission Similar Work
                  </Link>
                  <Link
                    href={`/community/repost/artwork/${artwork.id}`}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border font-semibold text-sm hover:bg-accent-subtle hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <Repeat2 className="w-4 h-4" />
                    Share to Community
                  </Link>
                  {artwork.instagramLink && (
                    <a href={artwork.instagramLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border font-semibold text-sm hover:bg-accent-subtle transition-colors">
                      <IconInstagram className="w-4 h-4" />
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>

            <CommentsSection targetId={artwork.id} targetType="artwork" title="Comments" />
          </div>
        </div>
      </main>
    </>
  );
}
