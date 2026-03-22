'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Artwork, Category } from '@prisma/client';

interface Props { artworks: Artwork[]; categories: Category[]; }

export function GalleryGrid({ artworks, categories }: Props) {
  const [q, setQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    let items = artworks;
    if (activeCategory !== 'All') items = items.filter(i => (i.category ?? '').toLowerCase() === activeCategory.toLowerCase());
    if (q) items = items.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));
    return items;
  }, [artworks, activeCategory, q]);

  return (
    <div className="px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-14 md:top-6 z-30 py-3 -mx-4 md:-mx-8 px-4 md:px-8 mb-8" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search artworks…" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 max-w-full">
              <button onClick={() => setActiveCategory('All')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === 'All' ? 'bg-primary text-white' : 'bg-accent-subtle text-foreground/70 hover:bg-border'}`}>All</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.name ? 'bg-primary text-white' : 'bg-accent-subtle text-foreground/70 hover:bg-border'}`}>{cat.name}</button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24"><Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" /><p className="text-muted-foreground">No artworks found.</p></div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/gallery/${item.slug}`} className="group block h-full">
                    <div className="card-base overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      <div className="relative w-full aspect-[4/3] bg-accent-subtle overflow-hidden">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-muted-foreground text-sm">{item.title}</div>
                        )}
                        {item.featured && <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm"><Star className="w-3 h-3 fill-yellow-900" /> Featured</div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        {!!item.category && <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1 capitalize">{item.category}</p>}
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 flex-1">{item.title}</h3>
                        <span className="text-sm text-primary font-medium inline-flex items-center gap-1.5 mt-3 group-hover:gap-2.5 transition-all">View Artwork <span>→</span></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
