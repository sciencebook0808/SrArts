'use client';
/**
 * lib/lenis-provider.tsx
 *
 * Smooth scroll via Lenis ^1.3.x, synced with GSAP ScrollTrigger.
 *
 * INTEGRATION NOTES (verified March 2026):
 *  – gsap.ticker.add() fires at RAF frequency (~60fps)
 *  – lenis.raf(time * 1000) — GSAP gives seconds, Lenis expects ms
 *  – lenis.on('scroll', ScrollTrigger.update) keeps ST positions accurate
 *  – gsap.ticker.lagSmoothing(0) prevents GSAP from skipping frames
 *  – We do NOT use requestAnimationFrame separately (GSAP ticker owns RAF)
 *
 * IMPORTANT: Do NOT mix a separate rAF loop with GSAP ticker + Lenis.
 * The GSAP ticker is the single source of truth for timing.
 */

import React, { useEffect, useState, createContext, useContext } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once at module level (safe to call multiple times)
gsap.registerPlugin(ScrollTrigger);

interface LenisContextValue { lenis: Lenis | null }
const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration:           1.20,
      easing:             (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:        'vertical',
      gestureOrientation: 'vertical',
      smoothWheel:        true,
      wheelMultiplier:    0.95,
      touchMultiplier:    2.0,
      infinite:           false,
    });

    setLenis(instance);

    // ── GSAP ticker drives Lenis (no separate rAF) ──────────────────────────
    const tickerFn = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // ── Keep ScrollTrigger in sync with Lenis scroll position ───────────────
    instance.on('scroll', ScrollTrigger.update);
    ScrollTrigger.addEventListener('refresh', () => instance.resize());

    // Initial refresh after layout settles
    const refreshTimeout = setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      clearTimeout(refreshTimeout);
      gsap.ticker.remove(tickerFn);
      instance.off('scroll', ScrollTrigger.update);
      ScrollTrigger.removeEventListener('refresh', () => instance.resize());
      instance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis }}>
      {children}
    </LenisContext.Provider>
  );
}

export function useLenis(): Lenis | null {
  return useContext(LenisContext).lenis;
}
