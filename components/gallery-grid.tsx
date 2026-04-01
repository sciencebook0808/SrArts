'use client';
/**
 * components/gallery-grid.tsx
 *
 * Gallery with first-visit paint-reveal effect.
 *
 * FIRST VISIT:
 *  – Each artwork card has a layered "bristle" overlay (3 staggered divs)
 *  – The overlay scales from right → left, creating a brush-wipe reveal
 *  – Cards reveal in a staggered sequence (0.08s apart)
 *  – After all cards reveal, localStorage flag is set
 *
 * SUBSEQUENT VISITS:
 *  – Normal Framer Motion fade-in (no heavy overlay)
 *
 * INTERACTIONS:
 *  – Card: lift + border glow on hover (Framer Motion whileHover)
 *  – Image: subtle zoom (CSS transition)
 *  – Category filter: AnimatePresence smooth swap
 *  – Search: instant filter with layout animation
 *
 * PERFORMANCE:
 *  – layout={true} batches reflows via Framer Motion
 *  – Images: next/image with proper sizes
 *  – First-visit check is synchronous (localStorage read on mount)
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Artwork, Category } from '@prisma/client';

const STORAGE_KEY = 'sr-gallery-painted';

interface Props {
  artworks:   Artwork[];
  categories: Category[];
}

// ─── Brush-wipe overlay (3 layered divs = bristles) ──────────────────────────
function BrushRevealOverlay({
  delay,
  onComplete,
}: {
  delay: number;
  onComplete?: () => void;
}) {
  // 3 offset layers create a brush-stroke feel
  const bristles = [
    { yOffset: '-12%', width: '105%', dur: 0.55 },
    { yOffset: '0%',   width: '100%', dur: 0.60 },
    { yOffset: '12%',  width: '108%', dur: 0.52 },
  ];

  return (
    <div
      className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
      style={{ transformOrigin: 'left center' }}
    >
      {bristles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            backgroundColor: '#fafaf9',
            width: b.width,
            top: b.yOffset,
            transformOrigin: 'right center',
            scaleX: 1,
          }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{
            duration:    b.dur,
            delay:       delay + i * 0.04,
            ease:        [0.37, 0, 0.63, 1] as const,
          }}
          onAnimationComplete={i === 1 ? onComplete : undefined}
        />
      ))}
    </div>
  );
}

// ─── Single artwork card ──────────────────────────────────────────────────────
interface CardProps {
  item:        Artwork;
  index:       number;
  paintReveal: boolean;
  onRevealed?: () => void;
}

function ArtworkCard({ item, index, paintReveal, onRevealed }: CardProps) {
  const staggerDelay = index * 0.075;

  const cardVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0,  transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as const } },
    exit:    { opacity: 0, scale: 0.94, transition: { duration: 0.20 } },
  };

  return (
    <motion.div
      layout
      key={item.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ '--stagger': staggerDelay } as React.CSSProperties}
    >
      <Link href={`/gallery/${item.slug}`} className="group block h-full">
        <motion.div
          className="card-base overflow-hidden h-full flex flex-col relative"
          whileHover={{
            y: -6,
            boxShadow: '0 20px 48px rgba(27,67,50,0.15), 0 4px 12px rgba(27,67,50,0.08)',
            transition: { type: 'spring', stiffness: 380, damping: 28 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Paint reveal overlay — first visit only */}
          {paintReveal && (
            <BrushRevealOverlay
              delay={staggerDelay}
              onComplete={onRevealed}
            />
          )}

          {/* Image container */}
          <div className="relative w-full aspect-[4/3] bg-accent-subtle overflow-hidden">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">{item.title}</span>
              </div>
            )}

            {/* Featured badge */}
            {item.featured && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-400 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                <Star className="w-3 h-3 fill-amber-900" />
                Featured
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Category on hover */}
            {item.category && (
              <motion.div
                className="absolute bottom-3 left-3 px-2.5 py-1 bg-primary/85 text-white text-xs font-semibold rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {item.category}
              </motion.div>
            )}
          </div>

          {/* Card body */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {item.title}
            </h3>
            <span className="text-sm text-primary font-medium inline-flex items-center gap-1.5 mt-1 group-hover:gap-2.5 transition-all">
              View Artwork
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: index * 0.15 }}
              >
                →
              </motion.span>
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Main gallery grid ────────────────────────────────────────────────────────
export function GalleryGrid({ artworks, categories }: Props) {
  const [q, setQ]                       = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [paintReveal, setPaintReveal]   = useState(false);
  const revealedCount                   = useRef(0);

  // Check first visit on mount (client-only)
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setPaintReveal(true);
      }
    } catch { /* SSR / incognito */ }
  }, []);

  const filtered = useMemo(() => {
    let items = artworks;
    if (activeCategory !== 'All') {
      items = items.filter(i => (i.category ?? '').toLowerCase() === activeCategory.toLowerCase());
    }
    if (q) {
      items = items.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));
    }
    return items;
  }, [artworks, activeCategory, q]);

  // Track when all images have been revealed
  const handleCardRevealed = () => {
    revealedCount.current += 1;
    if (revealedCount.current >= filtered.length) {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    }
  };

  return (
    <div className="px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Sticky filter bar ──────────────────────────────────────────── */}
        <div
          className="sticky top-14 md:top-6 z-30 py-3 -mx-4 md:-mx-8 px-4 md:px-8 mb-8"
          style={{
            background:          'rgba(255,255,255,0.88)',
            backdropFilter:      'blur(18px)',
            WebkitBackdropFilter:'blur(18px)',
            borderBottom:        '1px solid rgba(0,0,0,0.055)',
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search artworks…"
                className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full scrollbar-hide">
              {['All', ...categories.map(c => c.name)].map(cat => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={[
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 relative',
                    activeCategory === cat
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-accent-subtle text-foreground/70 hover:bg-border',
                  ].join(' ')}
                >
                  {activeCategory === cat && (
                    <motion.div
                      layoutId="category-pill"
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Gallery grid ───────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-28"
          >
            <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-25" />
            <p className="text-muted-foreground font-medium">No artworks found.</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <ArtworkCard
                  key={item.id}
                  item={item}
                  index={i}
                  paintReveal={paintReveal}
                  onRevealed={handleCardRevealed}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
