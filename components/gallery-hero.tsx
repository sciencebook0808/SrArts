'use client';
/**
 * components/gallery-hero.tsx
 *
 * Gallery page hero with:
 *  – GSAP text split-reveal (characters stagger in)
 *  – Parallax heading on scroll (heading moves up faster than page)
 *  – Framer Motion subtitle + count pill
 *  – Animated artwork count number
 *  – Decorative ink-stroke SVG
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function InkStrokeSVG() {
  return (
    <svg
      viewBox="0 0 400 40"
      className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-[320px] md:w-[480px]"
      aria-hidden="true"
    >
      <motion.path
        d="M 20 20 Q 200 8 380 20"
        stroke="oklch(0.65 0.20 160)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.55 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.37, 0, 0.63, 1] as const }}
      />
      <motion.path
        d="M 40 26 Q 210 18 360 26"
        stroke="oklch(0.50 0.17 150)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.30"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.30 }}
        transition={{ duration: 1.0, delay: 0.9, ease: [0.37, 0, 0.63, 1] as const }}
      />
    </svg>
  );
}

interface Props { count: number }

export function GalleryHero({ count }: Props) {
  const wrapRef     = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const bgRef       = useRef<HTMLDivElement>(null);

  // GSAP: parallax on scroll + heading stagger reveal
  useEffect(() => {
    const wrap    = wrapRef.current;
    const heading = headingRef.current;
    const bg      = bgRef.current;
    if (!wrap || !heading || !bg) return;

    const chars = Array.from(heading.querySelectorAll<HTMLElement>('.char'));

    // Heading character stagger reveal
    gsap.fromTo(chars,
      { y: 60, opacity: 0, rotateX: 45, filter: 'blur(8px)' },
      {
        y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)',
        duration: 0.65, ease: 'power3.out',
        stagger: 0.04,
        delay:   0.15,
      }
    );

    // Subtle parallax: heading moves up as user scrolls
    const tl = gsap.to(heading, {
      yPercent: -25,
      ease: 'none',
      scrollTrigger: {
        trigger:  wrap,
        start:    'top top',
        end:      'bottom top',
        scrub:    true,
      },
    });

    // Background gradient scale parallax
    gsap.to(bg, {
      scale: 1.08,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start:   'top top',
        end:     'bottom top',
        scrub:   true,
      },
    });

    return () => { tl.scrollTrigger?.kill(); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  const WORD = 'Gallery';
  const chars = WORD.split('').map((ch, i) => (
    <span key={i} className="char inline-block" style={{ transformOrigin: 'bottom center' }}>
      {ch}
    </span>
  ));

  return (
    <div ref={wrapRef} className="relative w-full pt-32 pb-16 px-4 md:px-8 overflow-hidden">
      {/* Background gradient */}
      <div
        ref={bgRef}
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, oklch(0.97 0.04 150) 0%, oklch(0.99 0.01 150) 50%, white 100%)',
          transformOrigin: 'center top',
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Eyebrow */}
        <motion.p
          className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          SR Arts Official
        </motion.p>

        {/* Main heading with split chars */}
        <h1
          ref={headingRef}
          className="text-6xl md:text-8xl font-extrabold leading-none tracking-tight mb-5 relative inline-block perspective-hero"
          style={{ perspective: '1000px' }}
        >
          {chars}
          <InkStrokeSVG />
        </h1>

        {/* Subtitle + count pill */}
        <motion.div
          className="flex flex-wrap items-center gap-4 mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.55 }}
        >
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Original artwork across multiple styles — each piece crafted from imagination.
          </p>

          {count > 0 && (
            <motion.div
              className="flex-shrink-0 glass-sm px-5 py-2.5 rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24, delay: 0.75 }}
            >
              <span className="text-primary font-extrabold text-lg">{count}</span>
              <span className="text-muted-foreground text-sm ml-1.5 font-medium">works</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
