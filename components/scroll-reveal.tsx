'use client';
/**
 * components/scroll-reveal.tsx
 *
 * Drop-in wrapper that applies GSAP ScrollTrigger animations to its children.
 *
 * Usage:
 *   <ScrollReveal preset="fadeUp" delay={0.1}>
 *     <MyComponent />
 *   </ScrollReveal>
 *
 *   <ScrollReveal preset="stagger" stagger={0.08} as="ul">
 *     <li>Item 1</li>
 *     <li>Item 2</li>
 *   </ScrollReveal>
 *
 * Props:
 *   preset    – animation type (default: 'fadeUp')
 *   delay     – GSAP delay in seconds (default: 0)
 *   duration  – GSAP duration in seconds (default: 0.75)
 *   stagger   – stagger interval for children (only with 'stagger' preset)
 *   start     – ScrollTrigger start string (default: 'top 88%')
 *   as        – HTML tag to use as wrapper (default: 'div')
 *   className – additional CSS classes
 *
 * Notes:
 *  – Initial CSS sets elements invisible (opacity:0) to prevent FOUC
 *  – Cleanup: all ScrollTrigger instances are killed on unmount
 *  – No re-animation on re-render (trigger created once on mount only)
 *  – Works with Lenis smooth scroll (lenis-provider syncs ScrollTrigger)
 */

import { useEffect, useRef } from 'react';
import {
  revealElement,
  revealStagger,
  type RevealPreset,
} from '@/lib/gsap-utils';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollRevealProps {
  children:  React.ReactNode;
  preset?:   RevealPreset;
  delay?:    number;
  duration?: number;
  stagger?:  number;
  start?:    string;
  ease?:     string;
  as?:       keyof JSX.IntrinsicElements;
  className?: string;
}

export function ScrollReveal({
  children,
  preset    = 'fadeUp',
  delay     = 0,
  duration  = 0.75,
  stagger   = 0.08,
  start     = 'top 88%',
  ease      = 'power3.out',
  as        = 'div',
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const st  = useRef<ScrollTrigger | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (preset === 'stagger') {
      st.current = revealStagger(el, { preset, delay, duration, stagger, start, ease });
    } else {
      st.current = revealElement(el, { preset, delay, duration, start, ease });
    }

    return () => { st.current?.kill(); };
  // Run once only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Tag = as as 'div';

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      // Initial invisible to prevent flash of unstyled content before GSAP runs
      style={{ opacity: 0 }}
    >
      {children}
    </Tag>
  );
}
