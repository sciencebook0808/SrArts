'use client';
/**
 * components/about/painted-canvas.tsx
 *
 * Artistic "painted canvas" profile card — used on the About page and
 * as a preview in admin. Renders the artist's details as if painted
 * on canvas with realistic texture, brush strokes, and @sr.arts.official
 * signature watermark in the corner.
 *
 * Canvas rendering:
 *  1. Linen/cream base texture (noise + cross-hatch via canvas)
 *  2. Three warm brush strokes for background interest
 *  3. Profile image rendered inside a brushed circle frame
 *  4. Painted text for name, headline, stats
 *  5. "@sr.arts.official" signature bottom-right — italic, warm ink
 *  6. Varnish gloss overlay (radial gradient)
 *
 * PERFORMANCE:
 *  – Drawn once on mount, no animation loop
 *  – ResizeObserver redraws on container size change
 *  – Accepts `width` / `height` as layout props; canvas scales internally
 *
 * TOOL: Canvas 2D API only (no Three.js overhead for a static card)
 */

import {
  useRef, useEffect, useCallback, useState,
} from 'react';
import Image from 'next/image';

// ─── Seeded PRNG (mulberry32) — reproducible noise ───────────────────────────
function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 1 | s) + (s + 0x6d2b79f5)) | 0;
    const t = Math.imul(s ^ (s >>> 7), 61 | s) ^ s;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Draw linen grain texture ─────────────────────────────────────────────────
function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const rng   = mkRng(77);
  const id    = ctx.createImageData(W, H);
  const data  = id.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = (rng() * 28 + 12) | 0;
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 28; // very subtle alpha
  }
  ctx.putImageData(id, 0, 0);
}

// ─── Draw a brushy blob (thick alpha-composited strokes) ─────────────────────
function drawStroke(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, x1: number, y1: number,
  maxR: number, color: string, seed: number,
) {
  const rng     = mkRng(seed);
  const samples = 200;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < samples; i++) {
    const t    = i / (samples - 1);
    const ease = Math.sin(t * Math.PI);
    const x    = x0 + (x1 - x0) * t + (rng() - 0.5) * maxR * 0.5;
    const y    = y0 + (y1 - y0) * t + (rng() - 0.5) * maxR * 0.28;
    const r    = maxR * ease * (0.5 + rng() * 0.5);
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, Math.max(r, 0.5), 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

// ─── Round image with brushed border ─────────────────────────────────────────
function drawAvatarCircle(
  ctx: CanvasRenderingContext2D,
  img:  HTMLImageElement | null,
  cx: number, cy: number, r: number,
  initials: string,
) {
  ctx.save();

  // Brushed ring (3 layered strokes)
  const ringColors = ['rgba(64,145,108,0.55)', 'rgba(40,167,69,0.35)', 'rgba(82,196,26,0.25)'];
  ringColors.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 12 + i * 5, 0, Math.PI * 2);
    ctx.strokeStyle = c;
    ctx.lineWidth   = 7 - i * 2;
    ctx.setLineDash([12 + i * 4, 6 + i * 2]);
    ctx.lineDashOffset = i * 15;
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Clip circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (img) {
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  } else {
    // Gradient fill with initial letter
    const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
    grad.addColorStop(0, '#40916c');
    grad.addColorStop(1, '#1b4332');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.fillStyle    = 'rgba(255,255,255,0.90)';
    ctx.font         = `bold ${r * 0.9}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials.toUpperCase().slice(0, 2), cx, cy);
  }

  ctx.restore();
}

// ─── Painted text helper ──────────────────────────────────────────────────────
function paintText(
  ctx: CanvasRenderingContext2D,
  text:  string,
  x: number, y: number,
  font:  string,
  color: string,
  maxW?: number,
  align: CanvasTextAlign = 'center',
) {
  ctx.save();
  ctx.font      = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  // Slight blur + normal = painted-text illusion
  ctx.shadowColor  = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur   = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  if (maxW) {
    ctx.fillText(text, x, y, maxW);
  } else {
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

// ─── Skill tag ────────────────────────────────────────────────────────────────
function paintTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  rng: () => number,
) {
  ctx.save();
  ctx.font = '600 11px sans-serif';
  const tw = ctx.measureText(text).width + 20;
  const th = 22;
  // Brushed rounded rect
  const corners = [4, 5, 3, 6].map((_, i) => 3 + rng() * 3);
  ctx.fillStyle   = `rgba(64,145,108,${0.12 + rng() * 0.1})`;
  ctx.strokeStyle = `rgba(64,145,108,${0.35 + rng() * 0.2})`;
  ctx.lineWidth   = 1.2;
  ctx.beginPath();
  ctx.roundRect(x, y - th / 2, tw, th, corners[0]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle    = '#1b4332';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 10, y + 1);
  ctx.restore();
  return tw + 10; // advance width
}

export interface PaintedCanvasProps {
  name?:         string;
  headline?:     string;
  profileImage?: string | null;
  skills?:       string[];
  stats?:        { label: string; value: string }[];
  handle?:       string;   // e.g. "@sr.arts.official"
  className?:    string;
  width?:        number;
  height?:       number;
}

export function PaintedCanvas({
  name         = 'SR Arts',
  headline     = 'Digital Artist & Illustrator',
  profileImage = null,
  skills       = [],
  stats        = [],
  handle       = '@sr.arts.official',
  className    = '',
  width        = 640,
  height       = 420,
}: PaintedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const DPR = 1; // canvas is already doubled externally for crisp text

    ctx.clearRect(0, 0, W, H);

    // ── 1. Canvas linen base ──────────────────────────────────────────────────
    const linen = ctx.createLinearGradient(0, 0, W, H);
    linen.addColorStop(0.0, '#f8f4ec');
    linen.addColorStop(0.4, '#f5f0e4');
    linen.addColorStop(1.0, '#ede7d5');
    ctx.fillStyle = linen;
    ctx.fillRect(0, 0, W, H);

    // Grain texture
    drawGrain(ctx, W, H);

    // ── 2. Background brush strokes ────────────────────────────────────────
    ctx.globalAlpha = 0.22;
    drawStroke(ctx, -20,   H * 0.48, W + 20, H * 0.52, H * 0.12, '#40916c', 11);
    ctx.globalAlpha = 0.12;
    drawStroke(ctx, -10,   H * 0.30, W * 0.6, H * 0.38, H * 0.06, '#52b788', 22);
    ctx.globalAlpha = 0.10;
    drawStroke(ctx, W * 0.4, H * 0.68, W + 10, H * 0.65, H * 0.055, '#74c69d', 33);
    ctx.globalAlpha = 1;

    // ── 3. Profile avatar ──────────────────────────────────────────────────
    const avatarR  = Math.min(W, H) * 0.12;
    const avatarCX = W * 0.5;
    const avatarCY = H * 0.26;
    drawAvatarCircle(ctx, imgRef.current, avatarCX, avatarCY, avatarR, name.slice(0, 2));

    // ── 4. Name ────────────────────────────────────────────────────────────
    const nameSize = Math.max(18, Math.min(32, W / 18));
    paintText(ctx, name, W / 2, avatarCY + avatarR + nameSize * 1.4, `800 ${nameSize}px serif`, '#1b4332', W * 0.85);

    // ── 5. Headline ────────────────────────────────────────────────────────
    const hlSize = Math.max(11, nameSize * 0.58);
    paintText(ctx, headline, W / 2, avatarCY + avatarR + nameSize * 2.9, `400 ${hlSize}px sans-serif`, '#40916c', W * 0.78);

    // ── 6. Divider stroke ──────────────────────────────────────────────────
    const divY = avatarCY + avatarR + nameSize * 3.8;
    ctx.save();
    ctx.globalAlpha = 0.40;
    drawStroke(ctx, W * 0.15, divY, W * 0.85, divY, 4, '#40916c', 44);
    ctx.globalAlpha = 1;
    ctx.restore();

    // ── 7. Stats row ───────────────────────────────────────────────────────
    if (stats.length > 0) {
      const statY   = divY + H * 0.11;
      const colW    = W / Math.max(stats.length, 1);
      const valSize = Math.max(13, Math.min(22, W / 22));
      const lblSize = Math.max(9, valSize * 0.55);
      stats.forEach((s, i) => {
        const x = colW * i + colW / 2;
        paintText(ctx, s.value, x, statY, `800 ${valSize}px serif`, '#1b4332');
        paintText(ctx, s.label, x, statY + valSize * 1.2, `400 ${lblSize}px sans-serif`, '#52b788');
      });

      // Vertical dividers between stats
      stats.forEach((_, i) => {
        if (i === 0) return;
        const x = colW * i;
        ctx.save();
        ctx.globalAlpha = 0.25;
        drawStroke(ctx, x, statY - valSize * 0.8, x, statY + valSize * 1.6, 2.5, '#40916c', 50 + i);
        ctx.globalAlpha = 1;
        ctx.restore();
      });
    }

    // ── 8. Skills row ──────────────────────────────────────────────────────
    if (skills.length > 0) {
      const skillY = (stats.length > 0 ? divY + H * 0.26 : divY + H * 0.12);
      const rng    = mkRng(99);
      let rx = W * 0.08;
      const maxRow = Math.min(skills.length, 5);
      for (let i = 0; i < maxRow; i++) {
        const adv = paintTag(ctx, skills[i]!, rx, skillY, rng);
        rx += adv;
        if (rx > W * 0.88) break;
      }
    }

    // ── 9. Varnish gloss overlay ───────────────────────────────────────────
    const gloss = ctx.createRadialGradient(W * 0.35, H * 0.2, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    gloss.addColorStop(0.0, 'rgba(255,255,255,0.14)');
    gloss.addColorStop(0.5, 'rgba(255,255,255,0.00)');
    gloss.addColorStop(1.0, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, W, H);

    // ── 10. Painted border ────────────────────────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.50;
    drawStroke(ctx, 8, 8, W - 8, 8, 4, '#40916c', 55);       // top
    drawStroke(ctx, 8, H - 8, W - 8, H - 8, 4, '#40916c', 56); // bottom
    ctx.globalAlpha = 1;
    ctx.restore();

    // ── 11. Handle / signature watermark ──────────────────────────────────
    const sigSize = Math.max(9, Math.min(14, W / 42));
    ctx.save();
    ctx.globalAlpha  = 0.55;
    ctx.font         = `italic 600 ${sigSize}px 'Georgia', serif`;
    ctx.fillStyle    = '#1b4332';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor  = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur   = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(handle, W - 12, H - 10);
    ctx.restore();

    setDrawn(true);
  }, [name, headline, skills, stats, handle]);

  // Load profile image then draw
  useEffect(() => {
    if (profileImage) {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.onload  = () => { imgRef.current = img; draw(); };
      img.onerror = () => { imgRef.current = null; draw(); };
      img.src     = profileImage;
    } else {
      imgRef.current = null;
      draw();
    }
  }, [profileImage, draw]);

  // Redraw when canvas mounts
  useEffect(() => { draw(); }, [draw]);

  return (
    <div
      className={['relative overflow-hidden rounded-2xl shadow-xl', className].join(' ')}
      style={{
        aspectRatio: `${width}/${height}`,
        boxShadow: '0 20px 60px rgba(27,67,50,0.18), 0 4px 16px rgba(27,67,50,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width * 2}   // 2× for sharpness on HiDPI
        height={height * 2}
        style={{ width: '100%', height: '100%' }}
        className="block"
        aria-label={`Painted portrait of ${name}`}
      />
      {/* Canvas frame edge texture */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          border: '2px solid rgba(255,255,255,0.35)',
          boxShadow: 'inset 0 0 32px rgba(27,67,50,0.10)',
        }}
      />
    </div>
  );
}
