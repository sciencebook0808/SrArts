'use client';
/**
 * components/hero-section.tsx
 *
 * Premium hero — lazy Three.js background, GSAP text reveal, Framer Motion CTAs.
 *
 * React 19 ref note:
 *   useRef<T>(null) returns RefObject<T> with { readonly current: T | null }.
 *   useTextReveal accepts RefObject<T extends HTMLElement> — the concrete element
 *   types (HTMLDivElement, etc.) are subtypes of HTMLElement, so they're assignable.
 */
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowDown, Sparkles } from 'lucide-react';

// Lazy-load Three.js — zero impact on initial bundle / LCP
const FloatingParticles = dynamic(
  () => import('./3d/floating-particles').then(m => m.FloatingParticles),
  { ssr: false }
);

// ── GSAP text reveal ─────────────────────────────────────────────────────────
// Generic over any HTMLElement subtype so the hook accepts all concrete ref types
function useTextReveal<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  delay = 0,
) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced || !ref.current) return;
    const el = ref.current;
    gsap.fromTo(
      el,
      { y: 40, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, delay, ease: 'power3.out' },
    );
  }, [ref, delay, prefersReduced]);
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 1.1 }}
      className="flex flex-col items-center px-6 py-3 rounded-2xl"
      style={{
        background:     'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        border:         '1px solid rgba(255,255,255,0.70)',
        boxShadow:      '0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <span className="text-2xl font-extrabold gradient-text">{value}</span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </motion.div>
  );
}

// ── CTA button with hover glow ────────────────────────────────────────────────
function CTAButton({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <Link
        href={href}
        className={[
          'inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all',
          primary
            ? 'bg-primary text-white shadow-lg hover:bg-primary-light hover:shadow-xl hover:shadow-primary/25'
            : 'border-2 border-primary text-primary hover:bg-accent-subtle hover:shadow-md',
        ].join(' ')}
      >
        {children}
      </Link>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function HeroSection() {
  const tagRef      = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);

  useTextReveal(tagRef,      0.2);
  useTextReveal(headlineRef, 0.45);
  useTextReveal(subRef,      0.7);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Three.js background ──────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.96_0.05_150)] via-white to-white">
        <Suspense fallback={null}>
          <FloatingParticles />
        </Suspense>
      </div>

      {/* ── Radial vignette ──────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(255,255,255,0.55) 100%)',
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">

        {/* Tag pill */}
        <div ref={tagRef} style={{ opacity: 0 }} className="inline-block mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-primary"
            style={{
              background:     'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(12px)',
              border:         '1px solid rgba(82,196,26,0.3)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Premium Artist Portfolio
          </div>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          style={{ opacity: 0 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
        >
          Where Art{' '}
          <span className="gradient-text">Comes to Life</span>
        </h1>

        {/* Sub-heading */}
        <p
          ref={subRef}
          style={{ opacity: 0 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Explore stunning original artwork, commission custom pieces, and connect
          with a community of art lovers. Every creation tells a story.
        </p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.6 }}
        >
          <CTAButton href="/gallery" primary>
            <span>Explore Gallery</span>
            <span className="text-lg">→</span>
          </CTAButton>
          <CTAButton href="/commission">
            Commission Now
          </CTAButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <StatPill value="500+"  label="Original Artworks" />
          <StatPill value="1K+"   label="Happy Clients" />
          <StatPill value="50K+"  label="Followers" />
        </motion.div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <motion.button
        onClick={() => {
          document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        aria-label="Scroll to gallery"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </section>
  );
}
