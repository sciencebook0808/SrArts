'use client';
/**
 * components/hero-section.tsx
 *
 * Awwwards-grade hero with canvas brush-painting intro.
 *
 * ANIMATION SEQUENCE:
 *  0.0 s – Dark canvas appears, cursor blink
 *  0.2 s – Stroke 1 sweeps (thick main stroke)
 *  0.8 s – Stroke 2 sweeps (counter stroke)
 *  1.3 s – Stroke 3 sweeps (accent stroke)
 *  1.5 s – "Welcome to" fades + scales in
 *  1.9 s – "SR Arts Official" letter-stagger reveal
 *  2.6 s – "By Anubhav Yadav" floats in
 *  3.2 s – Typewriter quotes loop
 *  7.0 s – Auto-transition (or skip click)
 *
 * TOOLS:
 *  Canvas 2D API  → brush stroke accumulation (circle-stamp technique)
 *  GSAP timeline  → precise timing + easing orchestration
 *  Framer Motion  → overlay fade, text spring, CTA buttons
 *  Three.js (lazy)→ interactive particle background
 *
 * PERFORMANCE:
 *  – Circles drawn once only (accumulated, no clear)
 *  – Seeded RNG (reproducible, no hydration mismatch)
 *  – requestAnimationFrame via gsap.ticker
 *  – SSR-safe (canvas only runs client-side)
 *  – Reduced-motion: skips to hero instantly
 */

import dynamic from 'next/dynamic';
import {
  useRef, useEffect, useState, useCallback,
  Suspense, useMemo,
} from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowDown, Sparkles, SkipForward } from 'lucide-react';

const FloatingParticles = dynamic(
  () => import('./3d/floating-particles').then(m => m.FloatingParticles),
  { ssr: false },
);

// ─── Seeded RNG (mulberry32) ──────────────────────────────────────────────────
function makePrng(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s = (Math.imul(s ^ (s >>> 15), 1 | s) + (s + 0x6D2B79F5)) | 0;
    const t = Math.imul(s ^ (s >>> 7), 61 | s) ^ s;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Polyline interpolation ───────────────────────────────────────────────────
function interpolatePath(
  pts: [number, number][],
  t: number,
): [number, number] {
  const n = pts.length - 1;
  const scaled = t * n;
  const i = Math.min(Math.floor(scaled), n - 1);
  const f = scaled - i;
  return [
    pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f,
    pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f,
  ];
}

// ─── Stroke definitions (normalised 0-1 coords) ───────────────────────────────
const STROKE_DEFS = [
  {
    // Wide sweep left→right — covers "SR Arts Official" region
    path:      [[0.00, 0.50], [0.18, 0.46], [0.38, 0.50], [0.60, 0.46], [0.82, 0.50], [1.00, 0.47]] as [number,number][],
    maxRadius: 0.072,   // fraction of canvas H
    color:     '#1b4332',
    alpha:     0.90,
    samples:   300,
    duration:  0.70,
    startAt:   0.20,
    seed:      42,
  },
  {
    // Counter sweep right→left — "Welcome to" region
    path:      [[1.00, 0.42], [0.78, 0.39], [0.52, 0.43], [0.28, 0.40], [0.00, 0.42]] as [number,number][],
    maxRadius: 0.050,
    color:     '#2d6a4f',
    alpha:     0.82,
    samples:   240,
    duration:  0.55,
    startAt:   0.72,
    seed:      137,
  },
  {
    // Thin accent sweep — "By Anubhav Yadav" region
    path:      [[0.05, 0.60], [0.30, 0.58], [0.55, 0.61], [0.80, 0.59], [0.98, 0.61]] as [number,number][],
    maxRadius: 0.032,
    color:     '#40916c',
    alpha:     0.75,
    samples:   200,
    duration:  0.48,
    startAt:   1.22,
    seed:      89,
  },
  {
    // Top edge whisper stroke
    path:      [[0.00, 0.35], [0.25, 0.33], [0.55, 0.36], [0.85, 0.34], [1.02, 0.35]] as [number,number][],
    maxRadius: 0.022,
    color:     '#52b788',
    alpha:     0.60,
    samples:   160,
    duration:  0.40,
    startAt:   0.50,
    seed:      55,
  },
] as const;

// ─── Pre-compute circle positions for each stroke ────────────────────────────
interface Circle { x: number; y: number; r: number }

function precomputeStroke(
  def: (typeof STROKE_DEFS)[number],
  W: number,
  H: number,
): Circle[] {
  const rng = makePrng(def.seed);
  const { samples, path, maxRadius } = def;
  const circles: Circle[] = [];

  for (let i = 0; i < samples; i++) {
    const t    = i / (samples - 1);
    const [nx, ny] = interpolatePath(path as [number,number][], t);
    const taper = Math.sin(t * Math.PI); // 0→1→0 (tapered ends)
    const r  = maxRadius * H * taper * (0.45 + rng() * 0.55);
    const jx = (rng() - 0.5) * r * 0.50;
    const jy = (rng() - 0.5) * r * 0.28;
    circles.push({ x: nx * W + jx, y: ny * H + jy, r: Math.max(r, 0.5) });
  }
  return circles;
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
const QUOTES = [
  'Art enables us to find ourselves and lose ourselves at the same time.',
  'Creativity takes courage.',
  'Every artist was first an amateur.',
  'Art is not what you see, but what you make others see.',
];

function useTypewriter(active: boolean) {
  const [display, setDisplay]   = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [phase, setPhase]       = useState<'typing' | 'pause' | 'erasing'>('typing');

  useEffect(() => {
    if (!active) return;
    const quote = QUOTES[quoteIdx % QUOTES.length]!;
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (display.length < quote.length) {
        t = setTimeout(() => setDisplay(quote.slice(0, display.length + 1)), 38);
      } else {
        t = setTimeout(() => setPhase('pause'), 2600);
      }
    } else if (phase === 'pause') {
      t = setTimeout(() => setPhase('erasing'), 200);
    } else {
      if (display.length > 0) {
        t = setTimeout(() => setDisplay(d => d.slice(0, -1)), 16);
      } else {
        setQuoteIdx(n => n + 1);
        setPhase('typing');
      }
    }
    return () => clearTimeout(t);
  }, [active, display, phase, quoteIdx]);

  return display;
}

// ─── Canvas intro component ───────────────────────────────────────────────────
interface IntroProps { onComplete: () => void }

function CanvasIntro({ onComplete }: IntroProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const prevCounts  = useRef(STROKE_DEFS.map(() => 0));
  const circlesRef  = useRef<Circle[][] | null>(null);
  const progressObj = useRef({ s0: 0, s1: 0, s2: 0, s3: 0 });
  const tlRef       = useRef<gsap.core.Timeline | null>(null);
  const tickFn      = useRef<((time: number) => void) | null>(null);

  // Text reveal refs (via GSAP)
  const welcomeRef  = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const bylineRef   = useRef<HTMLDivElement>(null);
  const skipRef     = useRef<HTMLButtonElement>(null);
  const [quoteActive, setQuoteActive] = useState(false);
  const quote       = useTypewriter(quoteActive);
  const [fading, setFading]           = useState(false);

  // ── Resize handler ──────────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    // Recompute circles for new size
    circlesRef.current = STROKE_DEFS.map(def =>
      precomputeStroke(def, canvas.width, canvas.height)
    );
    prevCounts.current = STROKE_DEFS.map(() => 0);
  }, []);

  // ── Draw frame (called by GSAP ticker) ──────────────────────────────────────
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !circlesRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prog = progressObj.current;
    const progs = [prog.s0, prog.s1, prog.s2, prog.s3];

    STROKE_DEFS.forEach((def, si) => {
      const circles = circlesRef.current![si];
      if (!circles) return;
      const targetCount = Math.floor(circles.length * progs[si]);
      const prevCount   = prevCounts.current[si];
      if (targetCount <= prevCount) return;

      // Batch-draw only NEW circles (canvas accumulates — never cleared)
      ctx.save();
      ctx.globalAlpha = def.alpha;
      ctx.fillStyle   = def.color;
      ctx.beginPath();
      for (let c = prevCount; c < targetCount; c++) {
        const { x, y, r } = circles[c];
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
      prevCounts.current[si] = targetCount;
    });
  }, []);

  // ── Trigger complete ─────────────────────────────────────────────────────────
  const triggerComplete = useCallback(() => {
    setFading(true);
    setTimeout(onComplete, 700);
  }, [onComplete]);

  // ── GSAP timeline ────────────────────────────────────────────────────────────
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Fill canvas background
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    ctx.fillStyle = '#0d1f16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Register draw tick
    const tick = () => drawFrame();
    tickFn.current = tick;
    gsap.ticker.add(tick);

    const p = progressObj.current;
    const tl = gsap.timeline();
    tlRef.current = tl;

    // ── Stroke animations ──────────────────────────────────────────────────
    tl.to(p, { s3: 1, duration: 0.40, ease: 'none' }, 0.50)
      .to(p, { s0: 1, duration: 0.70, ease: 'none' }, 0.20)
      .to(p, { s1: 1, duration: 0.55, ease: 'none' }, 0.72)
      .to(p, { s2: 1, duration: 0.48, ease: 'none' }, 1.22);

    // ── Text reveals ──────────────────────────────────────────────────────
    if (welcomeRef.current) {
      tl.fromTo(welcomeRef.current,
        { opacity: 0, y: 18, filter: 'blur(6px)' },
        { opacity: 1, y: 0,  filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' },
        1.55
      );
    }

    if (titleRef.current) {
      // Split title chars into spans for stagger
      const chars = titleRef.current.querySelectorAll<HTMLElement>('.char');
      tl.fromTo(chars,
        { opacity: 0, y: 22, rotateX: 40 },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.45, ease: 'power3.out',
          stagger: 0.028,
        },
        1.92
      );
    }

    if (bylineRef.current) {
      tl.fromTo(bylineRef.current,
        { opacity: 0, y: 12, filter: 'blur(4px)' },
        { opacity: 1, y: 0,  filter: 'blur(0px)', duration: 0.50, ease: 'power2.out' },
        2.62
      );
    }

    if (skipRef.current) {
      tl.fromTo(skipRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        1.20
      );
    }

    // Start typewriter
    tl.call(() => setQuoteActive(true), [], 3.20);

    // Auto-complete after 7.5s
    tl.call(triggerComplete, [], 7.50);

    return () => {
      tl.kill();
      if (tickFn.current) gsap.ticker.remove(tickFn.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize, drawFrame, triggerComplete]);

  // Title characters as spans for stagger
  const TITLE = 'SR Arts Official';
  const titleChars = useMemo(() =>
    TITLE.split('').map((ch, i) => (
      <span key={i} className="char inline-block" style={{ transformOrigin: 'bottom center' }}>
        {ch === ' ' ? '\u00a0' : ch}
      </span>
    ))
  , []);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.75, ease: 'easeInOut' }}
    >
      {/* Canvas layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Cursor blink while loading */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-10 bg-white/70"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: 2, repeatType: 'loop' }}
      />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none px-4">
        {/* "Welcome to" */}
        <div
          ref={welcomeRef}
          style={{ opacity: 0 }}
          className="text-[#95d5b2] text-base sm:text-lg font-medium tracking-[0.2em] uppercase mb-3"
        >
          Welcome to
        </div>

        {/* "SR Arts Official" — stagger chars */}
        <div
          ref={titleRef}
          className="text-white text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 text-center leading-none perspective-[800px]"
          style={{ perspective: '800px' }}
        >
          {titleChars}
        </div>

        {/* "By Anubhav Yadav" */}
        <div
          ref={bylineRef}
          style={{ opacity: 0 }}
          className="text-[#74c69d] text-base sm:text-xl font-light tracking-[0.12em] mb-8"
        >
          By Anubhav Yadav
        </div>

        {/* Typewriter quote */}
        {quoteActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md text-center text-[#d8f3dc]/80 text-sm font-light italic leading-relaxed"
          >
            &ldquo;{quote}<span className="opacity-70 animate-pulse">|</span>&rdquo;
          </motion.div>
        )}
      </div>

      {/* Skip button */}
      <button
        ref={skipRef}
        style={{ opacity: 0 }}
        onClick={triggerComplete}
        className="absolute bottom-8 right-8 flex items-center gap-2 text-white/50 hover:text-white/90 text-xs font-medium tracking-widest uppercase transition-colors duration-200 group pointer-events-auto"
      >
        Skip
        <SkipForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </motion.div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, delay }}
      whileHover={{ scale: 1.06, y: -2 }}
      className="flex flex-col items-center px-5 py-3 rounded-2xl cursor-default"
      style={{
        background:     'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border:         '1px solid rgba(255,255,255,0.72)',
        boxShadow:      '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <span className="text-2xl font-extrabold gradient-text">{value}</span>
      <span className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</span>
    </motion.div>
  );
}

// ─── CTA button with magnetic hover ──────────────────────────────────────────
function CTAButton({ href, children, primary = false, delay = 0 }: {
  href: string; children: React.ReactNode; primary?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.23, 1, 0.32, 1] as const }}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.96 }}
    >
      <Link
        href={href}
        className={[
          'inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-shadow duration-300',
          primary
            ? 'bg-primary text-white shadow-lg hover:bg-primary-light hover:shadow-xl hover:shadow-primary/30'
            : 'border-2 border-primary text-primary bg-white/60 backdrop-blur hover:bg-white hover:shadow-lg',
        ].join(' ')}
      >
        {children}
      </Link>
    </motion.div>
  );
}

// ─── Main hero content ────────────────────────────────────────────────────────
interface HeroStats { artworks: string; clients: string; followers: string }
interface HeroSectionProps { stats?: HeroStats }

export function HeroSection({ stats }: HeroSectionProps) {
  const prefersReduced = useReducedMotion();

  // Session storage: only show intro once per tab session
  const shouldShowIntro = useMemo(() => {
    if (prefersReduced) return false;
    if (typeof window === 'undefined') return false;
    try { return !sessionStorage.getItem('sr-intro-done'); } catch { return false; }
  }, [prefersReduced]);

  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  const [heroReady, setHeroReady] = useState(!shouldShowIntro);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setHeroReady(true);
    try { sessionStorage.setItem('sr-intro-done', '1'); } catch { /* incognito */ }
  }, []);

  const displayStats: HeroStats = stats ?? { artworks: '500+', clients: '1K+', followers: '50K+' };

  const tagRef      = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);

  // GSAP reveals for hero text
  useEffect(() => {
    if (!heroReady) return;
    const els = [tagRef.current, headlineRef.current, subRef.current].filter(Boolean);
    els.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { y: 36, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, delay: i * 0.18, ease: 'power3.out' }
      );
    });
  }, [heroReady]);

  return (
    <>
      {/* ── Canvas brush intro ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showIntro && <CanvasIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">

        {/* Three.js background — only after intro */}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.97_0.04_150)] via-white to-white">
          {heroReady && (
            <Suspense fallback={null}>
              <FloatingParticles />
            </Suspense>
          )}
        </div>

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 65% at 50% 45%, transparent 25%, rgba(255,255,255,0.60) 100%)' }}
        />

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: heroReady ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Tag pill */}
          <div ref={tagRef} style={{ opacity: 0 }} className="inline-block mb-6">
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-primary cursor-default"
              style={{
                background:     'rgba(255,255,255,0.68)',
                backdropFilter: 'blur(14px)',
                border:         '1px solid rgba(82,196,26,0.28)',
                boxShadow:      '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              SR Arts Official
            </motion.div>
          </div>

          {/* Main headline */}
          <h1
            ref={headlineRef}
            style={{ opacity: 0 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.04] tracking-tight mb-6"
          >
            Where Art{' '}
            <span className="gradient-text">Comes to Life</span>
          </h1>

          {/* Sub-heading */}
          <p
            ref={subRef}
            style={{ opacity: 0 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Explore stunning original artwork, commission custom pieces, and connect
            with a community of art lovers. Every creation tells a story.
          </p>

          {/* CTAs */}
          {heroReady && (
            <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
              <CTAButton href="/gallery" primary delay={0.6}>
                <span>Explore Gallery</span>
                <span className="text-lg leading-none">→</span>
              </CTAButton>
              <CTAButton href="/commission" delay={0.75}>
                Commission Now
              </CTAButton>
            </div>
          )}

          {/* Stats from DB */}
          {heroReady && (
            <motion.div
              className="flex flex-wrap items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <StatPill value={displayStats.artworks}  label="Original Artworks" delay={0.95} />
              <StatPill value={displayStats.clients}   label="Happy Clients"     delay={1.05} />
              <StatPill value={displayStats.followers} label="Followers"         delay={1.15} />
            </motion.div>
          )}
        </motion.div>

        {/* Scroll indicator */}
        {heroReady && (
          <motion.button
            onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            aria-label="Scroll to gallery"
          >
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }}
            >
              <ArrowDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        )}
      </section>
    </>
  );
}
