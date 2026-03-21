import { FloatingNavbar } from '@/components/floating-navbar';
import { getArtwork, incrementArtworkViews } from '@/lib/appwrite-server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Instagram, Eye } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArtworkPage({ params }: Props) {
  const { id } = await params;
  const artwork = await getArtwork(id);
  if (!artwork || artwork.status === 'draft') notFound();

  // Fire-and-forget view increment — void prefix satisfies TS no-floating-promise rule
  void incrementArtworkViews(id, Number(artwork.views ?? 0));

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      <div className="pt-24 md:pt-28 px-4 md:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-accent-subtle shadow-lg">
              {artwork.imageUrl ? (
                <Image
                  src={String(artwork.imageUrl)}
                  alt={String(artwork.title)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {artwork.category && (
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  {String(artwork.category)}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                {String(artwork.title)}
              </h1>

              {artwork.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {String(artwork.description)}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> {String(artwork.views ?? 0)} views
                </span>
                {artwork.price && (
                  <span className="text-primary font-bold text-lg">
                    ${Number(artwork.price).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link
                  href="/commission"
                  className="flex-1 text-center py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors shadow-sm"
                >
                  Commission Similar Work
                </Link>
                {artwork.instagramLink && (
                  <a
                    href={String(artwork.instagramLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border font-semibold text-sm hover:bg-accent-subtle transition-colors"
                  >
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
