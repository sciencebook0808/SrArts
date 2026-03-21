'use client';

import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';

type LenisContextType = {
  lenis: Lenis | null;
};

export const LenisContext = React.createContext<LenisContextType>({ lenis: null });

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    setLenis(lenisInstance);

    let rafId: number;

    const raf = (time: number) => {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis }}>
      {children}
    </LenisContext.Provider>
  );
}

export function useLenis() {
  const context = React.useContext(LenisContext);
  if (!context) {
    throw new Error('useLenis must be used within LenisProvider');
  }
  return context.lenis;
}
