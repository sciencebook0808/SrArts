'use client';
/**
 * components/cursor-trail.tsx
 *
 * Premium custom cursor for desktop — invisible on mobile.
 *
 * Inner dot:  follows cursor exactly (no lag) via CSS transform
 * Outer ring: follows with spring physics (Framer Motion useSpring)
 *
 * Bonus:
 *  – Expands on hover over links/buttons (detected via pointer-events)
 *  – Collapses to dot on click
 *  – Hidden on touch devices
 *
 * Tool: Framer Motion (spring physics, perfect for cursor ring lag)
 * Performance: single rAF via Framer Motion, no polling, CSS will-change
 *
 * Add to layout.tsx, rendered once at app root:
 *   <CursorTrail />
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export function CursorTrail() {
  const [visible,   setVisible]   = useState(false);
  const [clicking,  setClicking]  = useState(false);
  const [hovering,  setHovering]  = useState(false);
  const [isMobile,  setIsMobile]  = useState(true);

  // Inner dot position (follows exactly)
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // Outer ring with spring lag
  const ringX = useSpring(useMotionValue(-100), { stiffness: 150, damping: 22, mass: 0.5 });
  const ringY = useSpring(useMotionValue(-100), { stiffness: 150, damping: 22, mass: 0.5 });

  useEffect(() => {
    // No cursor on touch / small screens
    const media = window.matchMedia('(pointer: coarse)');
    if (media.matches || window.innerWidth < 768) return;
    setIsMobile(false);

    const onMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    const onDown  = () => setClicking(true);
    const onUp    = () => setClicking(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovering(!!(t.closest('a, button, [role="button"], label, input, textarea, select')));
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseover',  onOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseover',  onOver);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isMobile) return null;

  const ringSize = hovering ? 40 : clicking ? 16 : 32;
  const dotSize  = clicking ? 3 : 5;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full border border-primary/60 mix-blend-multiply"
        style={{
          x: ringX,
          y: ringY,
          width:       ringSize,
          height:      ringSize,
          marginLeft:  -ringSize / 2,
          marginTop:   -ringSize / 2,
          opacity:     visible ? 0.7 : 0,
          transition:  'width 0.2s ease, height 0.2s ease, opacity 0.2s ease, margin 0.2s ease',
          willChange:  'transform',
          background:  hovering ? 'rgba(82,196,26,0.12)' : 'transparent',
        }}
      />

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed z-[10000] rounded-full bg-primary"
        style={{
          x:          dotX,
          y:          dotY,
          width:      dotSize,
          height:     dotSize,
          marginLeft: -dotSize / 2,
          marginTop:  -dotSize / 2,
          opacity:    visible ? 0.9 : 0,
          transition: 'width 0.12s ease, height 0.12s ease, opacity 0.15s ease, margin 0.12s ease',
          willChange: 'transform',
        }}
      />
    </>
  );
}
