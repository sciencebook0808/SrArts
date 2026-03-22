'use client';
/**
 * lib/gsap-utils.ts
 *
 * GSAP + ScrollTrigger utilities for section reveals, counters, parallax.
 *
 * DESIGN RULES:
 *  – All functions return their ScrollTrigger instance(s) for cleanup
 *  – Functions are pure (no side effects outside the DOM node passed in)
 *  – Lenis sync is handled in lenis-provider.tsx, not here
 *
 * VERIFIED: gsap ^3.14.2 + gsap/ScrollTrigger (included, no separate install)
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once (idempotent)
gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────
export type RevealPreset =
  | 'fadeUp'
  | 'fadeIn'
  | 'fadeBlur'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'stagger';

interface RevealOptions {
  preset?:     RevealPreset;
  delay?:      number;
  duration?:   number;
  start?:      string;  // ScrollTrigger start, e.g. 'top 85%'
  stagger?:    number;  // only for 'stagger' preset
  ease?:       string;
}

// ─── Reveal preset definitions ────────────────────────────────────────────────
const PRESETS: Record<RevealPreset, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
  fadeUp: {
    from: { y: 44,  opacity: 0 },
    to:   { y: 0,   opacity: 1 },
  },
  fadeIn: {
    from: { opacity: 0 },
    to:   { opacity: 1 },
  },
  fadeBlur: {
    from: { opacity: 0, filter: 'blur(10px)', y: 20 },
    to:   { opacity: 1, filter: 'blur(0px)',  y: 0  },
  },
  slideLeft: {
    from: { x: -55, opacity: 0 },
    to:   { x: 0,   opacity: 1 },
  },
  slideRight: {
    from: { x: 55, opacity: 0 },
    to:   { x: 0,  opacity: 1 },
  },
  scale: {
    from: { scale: 0.88, opacity: 0 },
    to:   { scale: 1,    opacity: 1 },
  },
  stagger: {
    from: { y: 32, opacity: 0 },
    to:   { y: 0,  opacity: 1 },
  },
};

// ─── Single element reveal ────────────────────────────────────────────────────
export function revealElement(
  el: HTMLElement | null,
  options: RevealOptions = {},
): ScrollTrigger | undefined {
  if (!el) return;

  const {
    preset   = 'fadeUp',
    delay    = 0,
    duration = 0.75,
    start    = 'top 88%',
    ease     = 'power3.out',
  } = options;

  const { from, to } = PRESETS[preset];

  const st = ScrollTrigger.create({
    trigger:     el,
    start,
    toggleActions: 'play none none none',
    onEnter: () => {
      gsap.fromTo(el, from, { ...to, duration, delay, ease });
    },
  });
  return st;
}

// ─── Stagger reveal for a group of children ───────────────────────────────────
export function revealStagger(
  container: HTMLElement | null,
  options: RevealOptions = {},
): ScrollTrigger | undefined {
  if (!container) return;

  const {
    preset   = 'stagger',
    delay    = 0,
    duration = 0.65,
    start    = 'top 88%',
    stagger  = 0.08,
    ease     = 'power3.out',
  } = options;

  const children = Array.from(container.children) as HTMLElement[];
  if (!children.length) return;

  const { from, to } = PRESETS[preset];

  const st = ScrollTrigger.create({
    trigger:     container,
    start,
    toggleActions: 'play none none none',
    onEnter: () => {
      gsap.fromTo(children, from, { ...to, duration, delay, ease, stagger });
    },
  });
  return st;
}

// ─── Animated counter (numbers count up on scroll) ───────────────────────────
export function animateCounter(
  el: HTMLElement | null,
  endValue: number,
  opts: { prefix?: string; suffix?: string; duration?: number; start?: string } = {},
): ScrollTrigger | undefined {
  if (!el) return;

  const { prefix = '', suffix = '', duration = 1.6, start = 'top 85%' } = opts;
  const obj = { val: 0 };

  const st = ScrollTrigger.create({
    trigger: el,
    start,
    toggleActions: 'play none none none',
    onEnter: () => {
      gsap.to(obj, {
        val:      endValue,
        duration,
        ease:     'power2.out',
        onUpdate: () => {
          el.textContent = prefix + Math.round(obj.val).toLocaleString() + suffix;
        },
      });
    },
  });
  return st;
}

// ─── Parallax (element moves at different rate than scroll) ──────────────────
export function createParallax(
  el: HTMLElement | null,
  strength = 0.15,
): ScrollTrigger | undefined {
  if (!el) return;

  const st = ScrollTrigger.create({
    trigger:   el,
    start:     'top bottom',
    end:       'bottom top',
    scrub:     true,
    onUpdate:  (self) => {
      const y = self.progress * strength * 100;
      gsap.set(el, { y: `${y}%` });
    },
  });
  return st;
}

// ─── Horizontal scroll section ───────────────────────────────────────────────
export function createHorizontalScroll(
  track: HTMLElement | null,
): ScrollTrigger | undefined {
  if (!track) return;
  const panels = Array.from(track.children) as HTMLElement[];
  if (!panels.length) return;

  const totalWidth = panels.reduce((sum, p) => sum + p.offsetWidth, 0);

  return ScrollTrigger.create({
    trigger: track,
    start:   'top top',
    end:     () => `+=${totalWidth - window.innerWidth}`,
    pin:     true,
    scrub:   1,
    onUpdate: (self) => {
      gsap.set(track, { x: -(self.progress * (totalWidth - window.innerWidth)) });
    },
  });
}

// ─── Setup all [data-reveal] elements in a container ─────────────────────────
export function setupSectionReveals(container: HTMLElement): ScrollTrigger[] {
  const triggers: ScrollTrigger[] = [];

  container.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
    const preset   = (el.dataset.reveal ?? 'fadeUp') as RevealPreset;
    const delay    = parseFloat(el.dataset.revealDelay  ?? '0');
    const duration = parseFloat(el.dataset.revealDuration ?? '0.75');
    const st       = revealElement(el, { preset, delay, duration });
    if (st) triggers.push(st);
  });

  container.querySelectorAll<HTMLElement>('[data-stagger]').forEach(el => {
    const stagger  = parseFloat(el.dataset.stagger ?? '0.08');
    const preset   = (el.dataset.staggerPreset ?? 'stagger') as RevealPreset;
    const st       = revealStagger(el, { preset, stagger });
    if (st) triggers.push(st);
  });

  container.querySelectorAll<HTMLElement>('[data-parallax]').forEach(el => {
    const strength = parseFloat(el.dataset.parallax ?? '0.15');
    const st       = createParallax(el, strength);
    if (st) triggers.push(st);
  });

  return triggers;
}

export { ScrollTrigger };
