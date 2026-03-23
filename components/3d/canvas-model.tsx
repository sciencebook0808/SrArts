'use client';
/**
 * components/3d/canvas-model.tsx
 *
 * Artist easel + canvas board.
 *
 * DEFAULT:   Canvas faces slightly sideways (angled away from camera)
 *            Board shows a colourful abstract painting in progress.
 *
 * GALLERY:   Canvas rotates smoothly to face the viewer,
 *            board texture updates to show "View Artworks →" with a green theme.
 *            A soft green glow pulse highlights the canvas rim.
 *
 * COMMISSION: Canvas stays in place while boy turns to paint on it.
 *
 * Texture technique: a 2D HTML Canvas is created client-side and used as a
 * THREE.CanvasTexture applied to the canvas board mesh. The texture is
 * re-drawn and marked needsUpdate whenever the hovered state changes.
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import type { HoveredButton } from './boy-model';

// ─── Canvas texture drawing ───────────────────────────────────────────────────

function drawDefaultArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Warm cream base
  ctx.fillStyle = '#F8F3EB';
  ctx.fillRect(0, 0, w, h);

  // Subtle texture grain
  for (let i = 0; i < 120; i++) {
    const gx = Math.random() * w;
    const gy = Math.random() * h;
    ctx.fillStyle = `rgba(180,150,110,${0.03 + Math.random() * 0.04})`;
    ctx.fillRect(gx, gy, 2, 2);
  }

  // Paint palette – greens + warm accents
  const splashes: [number, number, number, string][] = [
    [0.22, 0.30, 38, '#52B788'],
    [0.55, 0.20, 24, '#40916C'],
    [0.75, 0.50, 31, '#74C69D'],
    [0.35, 0.65, 28, '#2D6A4F'],
    [0.68, 0.75, 22, '#B7E4C7'],
    [0.15, 0.58, 18, '#E63946AA'],
    [0.82, 0.28, 16, '#F4A261AA'],
    [0.48, 0.82, 20, '#2A9D8FAA'],
  ];
  splashes.forEach(([nx, ny, r, color]) => {
    ctx.beginPath();
    ctx.arc(nx * w, ny * h, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Expressive brush strokes
  ctx.lineCap = 'round';
  const strokes: [number, number, number, number, number, number, number, number, string, number][] = [
    [0.05, 0.35, 0.32, 0.18, 0.55, 0.42, 0.80, 0.28, '#1B4332', 6],
    [0.10, 0.60, 0.28, 0.45, 0.52, 0.72, 0.85, 0.55, '#2D6A4F', 4],
    [0.18, 0.80, 0.40, 0.62, 0.62, 0.88, 0.88, 0.78, '#40916C', 3],
    [0.60, 0.10, 0.72, 0.30, 0.50, 0.25, 0.38, 0.45, '#52B788', 5],
  ];
  strokes.forEach(([x1, y1, cx1, cy1, cx2, cy2, x2, y2, color, lw]) => {
    ctx.beginPath();
    ctx.moveTo(x1 * w, y1 * h);
    ctx.bezierCurveTo(cx1 * w, cy1 * h, cx2 * w, cy2 * h, x2 * w, y2 * h);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.globalAlpha = 0.82;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Golden frame
  ctx.strokeStyle = '#C8963A';
  ctx.lineWidth = 5;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.strokeStyle = '#E8B86088';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, w - 24, h - 24);
}

function drawGalleryText(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark forest green background
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1B4332');
  bg.addColorStop(1, '#2D6A4F');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Texture noise
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }

  // Borders
  ctx.strokeStyle = '#52B788';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.strokeStyle = '#74C69D40';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  // Brush icon
  const cx = w / 2;
  const midY = h / 2;

  ctx.save();
  ctx.translate(cx, midY - 56);
  ctx.fillStyle = '#74C69D';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#D8F3DC';
  ctx.fillRect(-3, 12, 6, 28);
  ctx.beginPath();
  ctx.moveTo(-8, 38);
  ctx.lineTo(8, 38);
  ctx.lineTo(3, 50);
  ctx.lineTo(-3, 50);
  ctx.closePath();
  ctx.fillStyle = '#95D5B2';
  ctx.fill();
  ctx.restore();

  // "View" text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#D8F3DC';
  ctx.font = `bold ${Math.round(w * 0.13)}px Georgia, serif`;
  ctx.fillText('View', cx, midY + 8);

  // "Artworks" text
  ctx.fillStyle = '#95D5B2';
  ctx.font = `bold ${Math.round(w * 0.11)}px Georgia, serif`;
  ctx.fillText('Artworks', cx, midY + 40);

  // Arrow
  ctx.fillStyle = '#52B788';
  ctx.font = `${Math.round(w * 0.10)}px sans-serif`;
  ctx.fillText('→', cx, midY + 68);

  // Corner accents
  const cornerLen = 18;
  ctx.strokeStyle = '#52B78888';
  ctx.lineWidth = 2;
  const corners: [number, number, number, number][] = [
    [22, 22, 1, 1], [w - 22, 22, -1, 1],
    [22, h - 22, 1, -1], [w - 22, h - 22, -1, -1],
  ];
  corners.forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + sy * cornerLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + sx * cornerLen, y);
    ctx.stroke();
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
interface CanvasModelProps {
  hovered: HoveredButton;
}

export function CanvasModel({ hovered }: CanvasModelProps) {
  // Canvas board refs
  const boardGroupRef = useRef<THREE.Group>(null);
  const boardMeshRef  = useRef<THREE.Mesh>(null);
  const glowRingRef   = useRef<THREE.Mesh>(null);

  // Texture state
  const canvasElRef   = useRef<HTMLCanvasElement | null>(null);
  const textureRef    = useRef<THREE.CanvasTexture | null>(null);

  // Helpers
  const redraw = useCallback((showGallery: boolean) => {
    const el  = canvasElRef.current;
    const tex = textureRef.current;
    if (!el || !tex) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    if (showGallery) {
      drawGalleryText(ctx, el.width, el.height);
    } else {
      drawDefaultArt(ctx, el.width, el.height);
    }
    tex.needsUpdate = true;
  }, []);

  // Create canvas texture client-side
  useEffect(() => {
    const el = document.createElement('canvas');
    el.width  = 512;
    el.height = 384;
    canvasElRef.current = el;

    const tex = new THREE.CanvasTexture(el);
    textureRef.current = tex;

    // Draw default art immediately
    const ctx = el.getContext('2d');
    if (ctx) drawDefaultArt(ctx, el.width, el.height);
    tex.needsUpdate = true;

    // Apply to board mesh
    const mesh = boardMeshRef.current;
    if (mesh) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map = tex;
      mat.needsUpdate = true;
    }

    return () => { tex.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update on hover change
  useEffect(() => {
    const board  = boardGroupRef.current;
    const glow   = glowRingRef.current;

    if (!board) return;

    if (hovered === 'gallery') {
      // Rotate canvas to face camera
      gsap.to(board.rotation, { y: 0, duration: 0.75, ease: 'power3.out' });
      // Glow ring fades in
      if (glow) {
        const mat = glow.material as THREE.MeshStandardMaterial;
        gsap.to(mat, { emissiveIntensity: 1.8, opacity: 0.72, duration: 0.5 });
      }
      // Redraw texture with text
      redraw(true);
    } else {
      // Return to default tilt
      gsap.to(board.rotation, { y: -0.72, duration: 0.70, ease: 'power2.out' });
      if (glow) {
        const mat = glow.material as THREE.MeshStandardMaterial;
        gsap.to(mat, { emissiveIntensity: 0.2, opacity: 0.22, duration: 0.5 });
      }
      redraw(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered]);

  // Glow pulse
  useFrame(({ clock }) => {
    const ring = glowRingRef.current;
    if (!ring) return;
    if (hovered === 'gallery') {
      const mat = ring.material as THREE.MeshStandardMaterial;
      const base = 1.8;
      mat.emissiveIntensity = base + Math.sin(clock.elapsedTime * 3.2) * 0.5;
    }
  });

  // ── Easel geometry ──────────────────────────────────────────────────────────
  const { easelMat, screwMat, boardMat } = useMemo(() => ({
    easelMat: new THREE.MeshToonMaterial({ color: '#6B3C18' }),
    screwMat: new THREE.MeshStandardMaterial({ color: '#AAAAAA', metalness: 0.8, roughness: 0.3 }),
    boardMat: new THREE.MeshStandardMaterial({ color: '#F5ECD8', roughness: 0.7 }),
  }), []);

  return (
    <group position={[-1.2, -0.5, 0]}>

      {/* ── Easel legs ──────────────────────────────────────────────────── */}
      {/* Left front leg */}
      <mesh material={easelMat} position={[-0.20, -0.10, 0.10]} rotation={[0.22, 0, -0.18]}>
        <cylinderGeometry args={[0.028, 0.024, 1.40, 7]} />
      </mesh>
      {/* Right front leg */}
      <mesh material={easelMat} position={[0.20, -0.10, 0.10]} rotation={[0.22, 0, 0.18]}>
        <cylinderGeometry args={[0.028, 0.024, 1.40, 7]} />
      </mesh>
      {/* Back leg */}
      <mesh material={easelMat} position={[0, -0.10, -0.20]} rotation={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.020, 1.35, 7]} />
      </mesh>

      {/* Cross-brace */}
      <mesh material={easelMat} position={[0, -0.55, 0.10]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.50, 6]} />
      </mesh>
      {/* Support brace back */}
      <mesh material={easelMat} position={[0, -0.42, -0.08]} rotation={[0.40, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.46, 6]} />
      </mesh>

      {/* Canvas ledge (shelf) */}
      <mesh material={easelMat} position={[0, -0.12, 0.05]} rotation={[0.22, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.020, 0.020, 0.56, 7]} />
      </mesh>

      {/* Pivot screws */}
      {([-0.22, 0.22] as const).map((x, i) => (
        <mesh key={i} material={screwMat} position={[x, 0.22, 0.10]}>
          <sphereGeometry args={[0.025, 7, 7]} />
        </mesh>
      ))}

      {/* ── Canvas board (rotates on gallery hover) ──────────────────── */}
      <group ref={boardGroupRef} position={[0, 0.40, 0.05]} rotation={[0, -0.72, 0]}>

        {/* Wooden frame */}
        {/* Top */}
        <mesh material={easelMat} position={[0, 0.37, 0]}>
          <boxGeometry args={[0.72, 0.040, 0.030]} />
        </mesh>
        {/* Bottom */}
        <mesh material={easelMat} position={[0, -0.37, 0]}>
          <boxGeometry args={[0.72, 0.040, 0.030]} />
        </mesh>
        {/* Left */}
        <mesh material={easelMat} position={[-0.34, 0, 0]}>
          <boxGeometry args={[0.040, 0.78, 0.030]} />
        </mesh>
        {/* Right */}
        <mesh material={easelMat} position={[0.34, 0, 0]}>
          <boxGeometry args={[0.040, 0.78, 0.030]} />
        </mesh>

        {/* Corner caps */}
        {([-0.34, 0.34] as const).flatMap(x =>
          ([-0.37, 0.37] as const).map((y, i) => (
            <mesh key={`${x}${y}`} material={screwMat} position={[x, y, 0.018]}>
              <sphereGeometry args={[0.022, 6, 6]} />
            </mesh>
          ))
        )}

        {/* Canvas surface — receives CanvasTexture */}
        <mesh ref={boardMeshRef} position={[0, 0, -0.005]} material={boardMat}>
          <planeGeometry args={[0.64, 0.70]} />
        </mesh>

        {/* Glow rim (gallery highlight) */}
        <mesh ref={glowRingRef} position={[0, 0, 0.002]}>
          <planeGeometry args={[0.70, 0.76]} />
          <meshStandardMaterial
            color="#52B788"
            emissive="#52B788"
            emissiveIntensity={0.2}
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </mesh>

      </group>
    </group>
  );
}
