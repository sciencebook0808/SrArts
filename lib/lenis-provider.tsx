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
    // Disable smooth scroll on mobile/touch devices:
    // - Lenis adds ~40-60ms INP latency on mobile due to RAF overhead
    // - Native momentum scrolling on iOS is already smooth
    // - Desktop users get smooth wheel scrolling as intended
    const isTouchDevice = typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Hijacking the scroll wheel is itself motion. Users who ask for reduced
    // motion get native, instant scrolling.
    const reduceMotion = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const smooth = !isTouchDevice && !reduceMotion;

    const instance = new Lenis({
      duration:           smooth ? 1.20 : 0,
      easing:             (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:        'vertical',
      gestureOrientation: 'vertical',
      smoothWheel:        smooth,
      wheelMultiplier:    0.95,
      // touchMultiplier disabled: let native iOS/Android handle touch scroll
      infinite:           false,
    });

    setLenis(instance);

    // ── GSAP ticker drives Lenis (no separate rAF) ──────────────────────────
    const tickerFn = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // ── Keep ScrollTrigger in sync with Lenis scroll position ───────────────
    instance.on('scroll', ScrollTrigger.update);

    // BUG FIX: the refresh handler used to be registered as an inline arrow and
    // then "removed" with a *second, different* arrow. Reference inequality
    // meant removeEventListener never matched, so every mount leaked a handler
    // that kept calling resize() on a destroyed Lenis instance. Hold one ref.
    const onRefresh = () => instance.resize();
    ScrollTrigger.addEventListener('refresh', onRefresh);

    // Initial refresh after layout settles
    const refreshTimeout = setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      clearTimeout(refreshTimeout);
      gsap.ticker.remove(tickerFn);
      instance.off('scroll', ScrollTrigger.update);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
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
