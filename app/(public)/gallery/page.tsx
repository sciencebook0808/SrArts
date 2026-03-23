import { FloatingNavbar } from '@/components/floating-navbar';
import { getArtworks, getCategories } from '@/lib/db-server';
import { GalleryGrid } from '@/components/gallery-grid';
import { GalleryHero } from '@/components/gallery-hero';
import type { Metadata } from 'next';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Gallery | SR Arts Official',
  description:
    'Explore original artwork across multiple styles — each piece crafted with passion by Anubhav Yadav.',
  openGraph: {
    title:       'Gallery | SR Arts Official',
    description: 'Explore original artwork across multiple styles.',
    type:        'website',
  },
};

export default async function GalleryPage() {
  const [artworks, categories] = await Promise.all([
    getArtworks(true),
    getCategories(),
  ]);

  return (
    <main className="w-full min-h-screen bg-white overflow-x-hidden">
      <FloatingNavbar />
      <GalleryHero count={artworks.length} />
      <GalleryGrid artworks={artworks} categories={categories} />
      <footer className="py-10 px-4 md:px-8 border-t border-border bg-accent-subtle/20 mt-8">
        <div className="max-w-6xl mx-auto text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SR Arts Official. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
