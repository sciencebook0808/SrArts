'use client';
/**
 * components/community/page-header.tsx
 *
 * Community page header with animated headline + "new post" CTA.
 * Desktop: shows "Write a post +" button top-right.
 * Mobile: FAB in the feed handles this.
 */
import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { Users, PenLine } from 'lucide-react';

export function CommunityPageHeader() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = headingRef.current;
    const l = lineRef.current;
    if (!h || !l) return;

    const chars = Array.from(h.querySelectorAll<HTMLElement>('.char'));

    gsap.fromTo(chars,
      { y: 40, opacity: 0, rotateX: 30, filter: 'blur(4px)' },
      {
        y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)',
        duration: 0.55, ease: 'power3.out',
        stagger: 0.035, delay: 0.1,
      }
    );

    gsap.fromTo(l,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', delay: 0.50 }
    );
  }, []);

  const WORD = 'Community';
  const chars = WORD.split('').map((ch, i) => (
    <span key={i} className="char inline-block" style={{ transformOrigin: 'bottom center' }}>
      {ch}
    </span>
  ));

  // Scroll to top of feed (which opens the composer)
  const scrollToComposer = () => {
    const composer = document.querySelector('[data-composer]');
    if (composer) {
      composer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="pt-28 md:pt-32 pb-8 px-4 md:px-6"
      style={{ background: 'linear-gradient(180deg, rgba(240,245,240,0.95) 0%, transparent 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Label */}
            <motion.div
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest mb-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Users className="w-4 h-4" />
              SR Arts
            </motion.div>

            {/* Animated headline */}
            <h1
              ref={headingRef}
              className="text-4xl md:text-6xl font-extrabold mb-3 leading-tight"
              style={{ perspective: '800px' }}
            >
              {chars}
            </h1>

            {/* Subtitle */}
            <p
              ref={lineRef}
              style={{ opacity: 0 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Connect with fellow art lovers, share your creative journey, and discover new perspectives.
            </p>
          </div>

          {/* Desktop CTA */}
          <motion.button
            type="button"
            onClick={scrollToComposer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="hidden md:flex items-center gap-2 px-5 py-3 bg-primary text-white
              font-semibold text-sm rounded-2xl hover:bg-primary-light transition-colors
              shadow-lg shadow-primary/20 shrink-0 mt-2"
          >
            <PenLine className="w-4 h-4" />
            Write a post
          </motion.button>
        </div>
      </div>
    </div>
  );
}
