'use client';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import { useLenis } from './lenis-provider';

gsap.registerPlugin(ScrollTrigger);

export function useScrollTrigger() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Sync Lenis with GSAP ScrollTrigger
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

// Animation helpers
export const animationConfig = {
  fadeIn: {
    opacity: 0,
    duration: 0.6,
  },
  slideUp: {
    y: 40,
    opacity: 0,
    duration: 0.6,
  },
  slideInLeft: {
    x: -40,
    opacity: 0,
    duration: 0.6,
  },
  slideInRight: {
    x: 40,
    opacity: 0,
    duration: 0.6,
  },
  scale: {
    scale: 0.95,
    opacity: 0,
    duration: 0.6,
  },
};

export function revealOnScroll(
  element: HTMLElement,
  animation: keyof typeof animationConfig = 'slideUp',
  delay = 0
) {
  if (!element) return;

  const config = animationConfig[animation];

  gsap.fromTo(
    element,
    { ...config },
    {
      ...Object.keys(config)
        .filter((key) => key !== 'duration')
        .reduce((acc, key) => {
          acc[key] = 0;
          return acc;
        }, {} as Record<string, number>),
      opacity: 1,
      duration: config.duration,
      delay,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'top 50%',
        scrub: false,
        markers: false,
      },
    }
  );
}
