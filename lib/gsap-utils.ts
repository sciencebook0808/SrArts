'use client';
/**
 * lib/gsap-utils.ts — GSAP + ScrollTrigger utilities
 * Synced with Lenis smooth scroll provider.
 */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import { useLenis } from './lenis-provider';

gsap.registerPlugin(ScrollTrigger);

export function useScrollTrigger() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    ScrollTrigger.refresh();
    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      ScrollTrigger.removeEventListener('refresh', () => lenis.resize());
    };
  }, [lenis]);
  return ScrollTrigger;
}

type AnimationType = 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scale';
const animations: Record<AnimationType, gsap.TweenVars> = {
  fadeIn:       { opacity: 0, duration: 0.6 },
  slideUp:      { y: 40,  opacity: 0, duration: 0.7 },
  slideInLeft:  { x: -40, opacity: 0, duration: 0.7 },
  slideInRight: { x:  40, opacity: 0, duration: 0.7 },
  scale:        { scale: 0.92, opacity: 0, duration: 0.6 },
};

export function revealOnScroll(
  element: HTMLElement,
  animation: AnimationType = 'slideUp',
  delay = 0
) {
  if (!element) return;
  const { duration, ...from } = animations[animation];
  const to: gsap.TweenVars = {
    opacity: 1, duration, delay, ease: 'power3.out',
    scrollTrigger: { trigger: element, start: 'top 82%', toggleActions: 'play none none none' },
  };
  // Reset motion properties
  Object.keys(from).forEach(k => { if (k !== 'opacity') (to as Record<string, unknown>)[k] = 0; });
  gsap.fromTo(element, from, to);
}
