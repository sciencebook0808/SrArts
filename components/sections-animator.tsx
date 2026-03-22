'use client';
/**
 * components/sections-animator.tsx
 *
 * Thin client boundary that initialises GSAP ScrollTrigger for the entire page.
 *
 * Pattern: Page is a Server Component; this wraps below-fold content in one
 * client boundary. On mount it walks all [data-reveal], [data-stagger], and
 * [data-parallax] elements in its subtree and wires them up.
 *
 * Why not <ScrollReveal> per section?
 *  – One boundary = one React client island = smaller JS bundle.
 *  – Server Components can still pass JSX children into this.
 *
 * Cleanup: all ScrollTrigger instances killed on unmount (React StrictMode safe).
 */

import { useEffect, useRef } from 'react';
import { setupSectionReveals, ScrollTrigger } from '@/lib/gsap-utils';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

interface Props { children: React.ReactNode }

export function SectionsAnimator({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggersRef  = useRef<ST[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Small delay so layout settles before measuring positions
    const id = requestAnimationFrame(() => {
      triggersRef.current = setupSectionReveals(container);
    });

    return () => {
      cancelAnimationFrame(id);
      triggersRef.current.forEach(t => t.kill());
      triggersRef.current = [];
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
