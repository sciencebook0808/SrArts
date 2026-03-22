'use client';
/**
 * lib/lenis-provider.tsx — Smooth scroll provider using Lenis ^1.3.x
 * Exposes useLenis() hook for scroll-dependent components (navbar, GSAP).
 */
import React, { useEffect, useState, createContext, useContext } from 'react';
import Lenis from 'lenis';

interface LenisContextValue { lenis: Lenis | null; }
const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration:         1.2,
      easing:           (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:      'vertical',
      gestureOrientation: 'vertical',
      smoothWheel:      true,
      wheelMultiplier:  1,
      touchMultiplier:  2,
    });

    setLenis(instance);

    let rafId: number;
    const raf = (time: number) => { instance.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);

    return () => { cancelAnimationFrame(rafId); instance.destroy(); };
  }, []);

  return <LenisContext.Provider value={{ lenis }}>{children}</LenisContext.Provider>;
}

export function useLenis(): Lenis | null {
  return useContext(LenisContext).lenis;
}
