import { FloatingNavbar } from '@/components/floating-navbar';
import { getArtworks, getCategories } from '@/lib/db-server';
import { GalleryGrid } from '@/components/gallery-grid';
import type { Metadata } from 'next';
export const revalidate = 30;
export const metadata: Metadata = { title: 'Gallery | SR Arts', description: 'Explore original artwork across multiple styles — each piece crafted from imagination.' };

export default async function GalleryPage() {
  const [artworks, categories] = await Promise.all([getArtworks(true), getCategories()]);
  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />
      <section className="pt-28 md:pt-32 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3">Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">Explore original artwork across multiple styles — each piece crafted from imagination.</p>
        </div>
      </section>
      <GalleryGrid artworks={artworks} categories={categories} />
      <footer className="py-10 px-4 md:px-8 border-t border-border bg-accent-subtle/20 mt-10">
        <div className="max-w-6xl mx-auto text-center"><p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SR Arts. All rights reserved.</p></div>
      </footer>
    </main>
  );
}
