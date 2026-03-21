'use client';

import { useState, useEffect } from 'react';
import { FloatingNavbar } from '@/components/floating-navbar';
import { Filter, Search } from 'lucide-react';
import Link from 'next/link';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  featured?: boolean;
}

const mockGalleryItems: GalleryItem[] = [
  { id: '1', title: 'Anime Character Study', category: 'anime', image: 'anime-1', featured: true },
  { id: '2', title: 'Realistic Portrait', category: 'realistic', image: 'realistic-1' },
  { id: '3', title: 'Modern Abstract', category: 'modern', image: 'modern-1' },
  { id: '4', title: 'Custom Commission', category: 'custom', image: 'custom-1', featured: true },
  { id: '5', title: 'Anime Scene', category: 'anime', image: 'anime-2' },
  { id: '6', title: 'Digital Portrait', category: 'realistic', image: 'realistic-2' },
];

const categories = ['All', 'Anime', 'Realistic', 'Modern', 'Custom'];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(mockGalleryItems);

  useEffect(() => {
    let items = mockGalleryItems;

    if (activeCategory !== 'All') {
      items = items.filter(
        (item) => item.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      items = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(items);
  }, [activeCategory, searchQuery]);

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      {/* Header */}
      <section className="pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explore our diverse collection of artwork across multiple styles and categories
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-24 z-40 py-4 px-4 md:px-8 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 flex-col md:flex-row items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-accent-subtle text-foreground hover:bg-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <Link key={item.id} href={`/gallery/${item.id}`}>
                  <div
                    className="card-base overflow-hidden group cursor-pointer h-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative w-full h-72 bg-accent-subtle overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300" />

                      {/* Featured Badge */}
                      {item.featured && (
                        <div className="absolute top-4 right-4 z-10 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                        {item.title}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 capitalize">
                        {item.category}
                      </p>
                      <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                        View Artwork <span>→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">No artworks found matching your criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      <section className="py-12 px-4 md:px-8 flex justify-center gap-2">
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent-subtle transition-colors">
          Previous
        </button>
        <button className="px-4 py-2 bg-primary text-white rounded-lg">1</button>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent-subtle transition-colors">
          2
        </button>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent-subtle transition-colors">
          3
        </button>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent-subtle transition-colors">
          Next
        </button>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border bg-accent-subtle/30 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 SR Arts. All rights reserved. • <a href="#" className="hover:text-primary">Privacy Policy</a> • <a href="#" className="hover:text-primary">Terms of Service</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
