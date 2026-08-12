'use client';
/**
 * components/cursor-trail.tsx
 *
 * Brush-style custom cursor for SR Arts — desktop pointer devices only.
 *
 * WHAT REPLACED WHAT
 *  The previous cursor was a generic glowing ring + dot: the same effect on
 *  every "premium" template, and unrelated to an art brand. This one behaves
 *  like a loaded brush:
 *
 *   • Nib      — a small ink-coloured mark that tracks the pointer exactly.
 *   • Body     — a soft, spring-lagged blob that trails the nib.
 *   • Ink trail— a short tapering stroke drawn behind fast movement, which
 *                fades out when the pointer rests (like paint drying).
 *   • Velocity — the body squashes along the direction of travel, so a quick
 *                flick stretches the brush the way a real one loads and drags.
 *   • Hover    — over links/buttons the brush opens into a soft ring so the
 *                target underneath stays readable; over gallery imagery it
 *                becomes a labelled "view" disc.
 *
 * IMPLEMENTATION NOTES
 *  – One rAF loop drives everything; pointer events only write to refs, so
 *    moving the mouse never triggers a React render. (The old version called
 *    setState on every mousemove via a stale closure.)
 *  – The trail is a single <canvas> sized to the viewport with a capped point
 *    buffer, so cost is bounded regardless of how long the page is open.
 *  – Renders nothing at all on touch/coarse pointers, on small screens, and
 *    when the user prefers reduced motion.
 *  – `pointer-events: none` throughout, and the native cursor is left visible
 *    on interactive elements so accessibility and hit-testing are unaffected.
 */

import { useEffect, useRef, useState } from 'react';

/** Ink colour — SR Arts primary, in a canvas-friendly space. */
const INK = 'oklch(0.50 0.17 150)';

/** Max points retained in the stroke buffer. */
const MAX_TRAIL = 18;

/** Interactive selectors that open the brush into a ring. */
const INTERACTIVE = 'a, button, [role="button"], label, input, textarea, select, summary';

/** Artwork/gallery surfaces get the "view" treatment. */
const ARTWORK = '[data-cursor="artwork"], .card-base img, .img-reveal-wrapper';

type Mode = 'brush' | 'interactive' | 'artwork';

interface Point { x: number; y: number; age: number }

export function CursorTrail() {
  // `enabled` is resolved once on mount; it never changes during a session.
  const [enabled, setEnabled] = useState(false);
  const [mode,    setMode]    = useState<Mode>('brush');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nibRef    = useRef<HTMLDivElement>(null);
  const bodyRef   = useRef<HTMLDivElement>(null);

  // All high-frequency state lives in refs — never in React state.
  const pointer = useRef({ x: -100, y: -100, down: false, seen: false });
  const body    = useRef({ x: -100, y: -100, vx: 0, vy: 0 });
  const trail   = useRef<Point[]>([]);
  const modeRef = useRef<Mode>('brush');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduce || window.innerWidth < 768) return;

    setEnabled(true);

    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d') ?? null;

    // ── Canvas sizing (DPR-aware) ───────────────────────────────────────────
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ── Pointer plumbing (refs only — zero re-renders) ──────────────────────
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      if (!pointer.current.seen) {
        pointer.current.seen = true;
        // Avoid a long streak from the off-screen origin on first movement.
        body.current.x = e.clientX;
        body.current.y = e.clientY;
      }
    };

    const onDown  = () => { pointer.current.down = true;  };
    const onUp    = () => { pointer.current.down = false; };
    const onEnter = () => { pointer.current.seen = true;  };
    const onLeave = () => { pointer.current.seen = false; };

    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const next: Mode = !t
        ? 'brush'
        : t.closest(INTERACTIVE) ? 'interactive'
        : t.closest(ARTWORK)     ? 'artwork'
        : 'brush';
      if (next !== modeRef.current) {
        modeRef.current = next;
        setMode(next);   // one render per hover-target change, not per pixel
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup',   onUp,   { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerenter', onEnter);
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);

    // ── Single animation loop ───────────────────────────────────────────────
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);

      const p = pointer.current;
      const b = body.current;

      // Spring the body toward the pointer — this produces the brush lag.
      const stiffness = 0.22;
      const damping   = 0.72;
      b.vx = (b.vx + (p.x - b.x) * stiffness) * damping;
      b.vy = (b.vy + (p.y - b.y) * stiffness) * damping;
      b.x += b.vx;
      b.y += b.vy;

      const speed = Math.hypot(b.vx, b.vy);

      // ── Nib: exact tracking ───────────────────────────────────────────────
      if (nibRef.current) {
        nibRef.current.style.transform =
          `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        nibRef.current.style.opacity = p.seen ? '1' : '0';
      }

      // ── Body: lagged, squashed along the direction of travel ──────────────
      if (bodyRef.current) {
        // Stretch with speed, clamped so a fast flick never looks broken.
        const stretch = Math.min(speed / 34, 0.5);
        const angle   = (Math.atan2(b.vy, b.vx) * 180) / Math.PI;
        const press   = p.down ? 0.78 : 1;

        bodyRef.current.style.transform =
          `translate3d(${b.x}px, ${b.y}px, 0) translate(-50%, -50%) ` +
          `rotate(${angle}deg) scale(${(1 + stretch) * press}, ${(1 - stretch * 0.55) * press})`;
        bodyRef.current.style.opacity = p.seen ? '1' : '0';
      }

      // ── Ink trail ─────────────────────────────────────────────────────────
      if (ctx && canvas) {
        // Only lay down ink when the brush is actually moving; resting the
        // pointer should not keep painting a blob.
        if (p.seen && speed > 0.6) {
          trail.current.push({ x: b.x, y: b.y, age: 0 });
          if (trail.current.length > MAX_TRAIL) trail.current.shift();
        } else if (trail.current.length) {
          trail.current.shift();
        }

        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        const pts = trail.current;
        if (pts.length > 2 && modeRef.current === 'brush') {
          ctx.save();
          ctx.strokeStyle = INK;
          ctx.lineCap  = 'round';
          ctx.lineJoin = 'round';

          // Draw as tapering segments: older = thinner and more transparent,
          // which reads as a brush stroke rather than a uniform tube.
          for (let i = 1; i < pts.length; i++) {
            const t = i / pts.length;           // 0 = oldest, 1 = newest
            ctx.globalAlpha = t * 0.30;
            ctx.lineWidth   = 1 + t * 7;
            ctx.beginPath();
            ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
            ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup',   onUp);
      window.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerenter', onEnter);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (!enabled) return null;

  // Body presentation per mode. Sizes are applied via CSS transitions so mode
  // changes ease rather than snap, without touching the rAF loop.
  const bodyStyle: React.CSSProperties =
    mode === 'interactive'
      ? { width: 44, height: 44, background: 'transparent', border: `1.5px solid ${INK}`, opacity: 0.75 }
      : mode === 'artwork'
      ? { width: 62, height: 62, background: 'oklch(0.50 0.17 150 / 0.16)', border: `1.5px solid ${INK}` }
      : { width: 26, height: 26, background: 'oklch(0.50 0.17 150 / 0.20)', border: '1.5px solid transparent' };

  return (
    <>
      {/* Ink trail — sits below the brush marks, above the page */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9997]"
      />

      {/* Brush body — lagged, squashed, mode-aware */}
      <div
        ref={bodyRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full"
        style={{
          ...bodyStyle,
          willChange: 'transform, opacity',
          transition: 'width .28s cubic-bezier(.22,1,.36,1), height .28s cubic-bezier(.22,1,.36,1), background .28s ease, border-color .28s ease, opacity .2s ease',
        }}
      />

      {/* Nib — exact pointer position */}
      <div
        ref={nibRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
        style={{
          width:      mode === 'brush' ? 5 : 4,
          height:     mode === 'brush' ? 5 : 4,
          background: INK,
          willChange: 'transform, opacity',
          transition: 'width .2s ease, height .2s ease, opacity .2s ease',
        }}
      />
    </>
  );
}
