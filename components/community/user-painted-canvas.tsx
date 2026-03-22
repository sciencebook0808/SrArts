'use client';
/**
 * components/community/user-painted-canvas.tsx
 *
 * Artistic painted-canvas card for ANY community user profile.
 *
 * Same technique as PaintedCanvas but:
 *  – Handle is dynamic: "@username"
 *  – Colours adapt to user initials (hue derived from name string)
 *  – Used on /[username] profile pages
 *  – Smaller compact size (profile card top section)
 *
 * When isOwnProfile = true, a subtle "Edit Profile" hint is shown.
 */

import { useRef, useEffect, useCallback } from 'react';

function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 1 | s) + (s + 0x6d2b79f5)) | 0;
    const t = Math.imul(s ^ (s >>> 7), 61 | s) ^ s;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strHash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const rng  = mkRng(42);
  const id   = ctx.createImageData(W, H);
  const data = id.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = (rng() * 24 + 8) | 0;
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 20;
  }
  ctx.putImageData(id, 0, 0);
}

function drawBrushStroke(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number,
  x1: number, y1: number,
  maxR: number, color: string, seed: number,
) {
  const rng = mkRng(seed);
  const N   = 160;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const t    = i / (N - 1);
    const ease = Math.sin(t * Math.PI);
    const x    = x0 + (x1 - x0) * t + (rng() - 0.5) * maxR * 0.5;
    const y    = y0 + (y1 - y0) * t + (rng() - 0.5) * maxR * 0.28;
    const r    = maxR * ease * (0.45 + rng() * 0.55);
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, Math.max(r, 0.5), 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

export interface UserPaintedCanvasProps {
  username:     string;
  displayName:  string;
  profileImage?: string | null;
  joinDate?:    string;
  postCount?:   number;
  likesCount?:  number;
  handle?:      string;   // "@username"
  className?:   string;
  width?:       number;
  height?:      number;
}

export function UserPaintedCanvas({
  username,
  displayName,
  profileImage  = null,
  joinDate      = '',
  postCount     = 0,
  likesCount    = 0,
  handle,
  className     = '',
  width         = 560,
  height        = 320,
}: UserPaintedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);

  // Derive accent color from name hash (green palette 130-185)
  const hash       = strHash(displayName || username);
  const hue        = 130 + (hash % 55);
  const strokeClr1 = `hsla(${hue}, 55%, 30%, 0.25)`;
  const strokeClr2 = `hsla(${hue}, 65%, 45%, 0.18)`;
  const textClr    = `hsl(${hue}, 50%, 22%)`;
  const accentClr  = `hsl(${hue}, 60%, 42%)`;

  const sig = handle ?? `@${username}`;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // ── Linen base ────────────────────────────────────────────────────────
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0.0, '#f8f4ec');
    base.addColorStop(0.6, '#f4efdf');
    base.addColorStop(1.0, '#ece6d2');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);
    drawGrain(ctx, W, H);

    // ── Background brush strokes ──────────────────────────────────────────
    ctx.globalAlpha = 1;
    drawBrushStroke(ctx, -10, H * 0.52, W + 10, H * 0.48, H * 0.15, strokeClr1, hash % 200);
    drawBrushStroke(ctx, -5,  H * 0.35, W * 0.7, H * 0.40, H * 0.06, strokeClr2, (hash + 7) % 200);

    // ── Avatar ────────────────────────────────────────────────────────────
    const aR  = Math.min(W, H) * 0.13;
    const aCX = W * 0.5;
    const aCY = H * 0.34;

    // Ring
    ctx.save();
    ctx.strokeStyle = accentClr;
    ctx.lineWidth   = 3;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(aCX, aCY, aR + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.28;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.arc(aCX, aCY, aR + 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Clip + draw image
    ctx.save();
    ctx.beginPath();
    ctx.arc(aCX, aCY, aR, 0, Math.PI * 2);
    ctx.clip();
    if (imgRef.current) {
      ctx.drawImage(imgRef.current, aCX - aR, aCY - aR, aR * 2, aR * 2);
    } else {
      const grad = ctx.createRadialGradient(aCX - aR * 0.2, aCY - aR * 0.2, 0, aCX, aCY, aR);
      grad.addColorStop(0, accentClr);
      grad.addColorStop(1, textClr);
      ctx.fillStyle = grad;
      ctx.fillRect(aCX - aR, aCY - aR, aR * 2, aR * 2);
      ctx.fillStyle    = 'rgba(255,255,255,0.92)';
      ctx.font         = `bold ${aR * 0.85}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayName.slice(0, 2).toUpperCase(), aCX, aCY);
    }
    ctx.restore();

    // ── Name ──────────────────────────────────────────────────────────────
    const nameSize = Math.max(14, Math.min(24, W / 22));
    ctx.save();
    ctx.font         = `800 ${nameSize}px serif`;
    ctx.fillStyle    = textClr;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur   = 3;
    ctx.fillText(displayName, W / 2, aCY + aR + nameSize * 1.4, W * 0.8);
    ctx.restore();

    // ── Handle ────────────────────────────────────────────────────────────
    const handleSize = Math.max(10, nameSize * 0.62);
    ctx.save();
    ctx.font         = `500 ${handleSize}px sans-serif`;
    ctx.fillStyle    = accentClr;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`@${username}`, W / 2, aCY + aR + nameSize * 2.8, W * 0.75);
    ctx.restore();

    // ── Divider ───────────────────────────────────────────────────────────
    const divY = aCY + aR + nameSize * 3.6;
    ctx.save();
    ctx.globalAlpha = 0.35;
    drawBrushStroke(ctx, W * 0.2, divY, W * 0.8, divY, 3, accentClr, 99);
    ctx.globalAlpha = 1;
    ctx.restore();

    // ── Stats ─────────────────────────────────────────────────────────────
    const statY   = divY + H * 0.12;
    const valSize = Math.max(12, Math.min(18, W / 26));
    const lblSize = valSize * 0.65;

    [
      { v: String(postCount),  l: 'Posts'  },
      { v: String(likesCount), l: 'Likes'  },
      ...(joinDate ? [{ v: joinDate, l: 'Joined' }] : []),
    ].forEach((s, i, arr) => {
      const x = (W / arr.length) * i + (W / arr.length) / 2;
      ctx.save();
      ctx.font         = `800 ${valSize}px serif`;
      ctx.fillStyle    = textClr;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = 'rgba(0,0,0,0.10)';
      ctx.shadowBlur   = 2;
      ctx.fillText(s.v, x, statY);
      ctx.font      = `500 ${lblSize}px sans-serif`;
      ctx.fillStyle = accentClr;
      ctx.fillText(s.l, x, statY + valSize * 1.35);
      ctx.restore();
    });

    // ── Varnish gloss ──────────────────────────────────────────────────────
    const gloss = ctx.createRadialGradient(W * 0.30, H * 0.20, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
    gloss.addColorStop(0,   'rgba(255,255,255,0.12)');
    gloss.addColorStop(0.5, 'rgba(255,255,255,0.00)');
    gloss.addColorStop(1,   'rgba(0,0,0,0.05)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, W, H);

    // ── Signature watermark ───────────────────────────────────────────────
    const sigSize = Math.max(8, Math.min(12, W / 46));
    ctx.save();
    ctx.globalAlpha  = 0.45;
    ctx.font         = `italic 600 ${sigSize}px 'Georgia', serif`;
    ctx.fillStyle    = textClr;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor  = 'rgba(255,255,255,0.6)';
    ctx.shadowBlur   = 2;
    ctx.fillText(sig, W - 10, H - 8);
    ctx.restore();
  }, [displayName, username, postCount, likesCount, joinDate, strokeClr1, strokeClr2, textClr, accentClr, sig, hash]);

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

  useEffect(() => { draw(); }, [draw]);

  return (
    <div
      className={['relative overflow-hidden rounded-2xl', className].join(' ')}
      style={{
        aspectRatio: `${width}/${height}`,
        boxShadow: '0 16px 48px rgba(27,67,50,0.15), 0 3px 12px rgba(27,67,50,0.08), inset 0 1px 0 rgba(255,255,255,0.50)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width * 2}
        height={height * 2}
        style={{ width: '100%', height: '100%' }}
        className="block"
        aria-label={`Painted portrait of ${displayName}`}
      />
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          border:     '2px solid rgba(255,255,255,0.32)',
          boxShadow:  'inset 0 0 28px rgba(27,67,50,0.08)',
        }}
      />
    </div>
  );
}
