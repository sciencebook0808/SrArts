'use client';
/**
 * components/3d/hero-scene.tsx
 *
 * Interactive 3D hero scene — boy artist + easel.
 *
 * POSITIONING:
 *   Rendered in a fixed-size div (280 × 380px) positioned absolutely in the
 *   hero section's bottom-right quadrant. Only shown on xl+ screens.
 *   Canvas has pointer-events: none so it never intercepts UI interactions.
 *
 * HOVER STATES (driven by parent component state):
 *   'gallery'    → easel canvas rotates to face viewer, "View Artworks" text appears
 *   'commission' → boy rotates toward canvas, right arm paints
 *   null         → idle: boy waves, canvas angled sideways
 *
 * PERFORMANCE:
 *   - 280 × 380 canvas — tiny GPU footprint
 *   - DPR capped at 1.5 desktop
 *   - alpha: true transparent background
 *   - Low-poly geometry throughout
 */

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { BoyModel }    from './boy-model';
import { CanvasModel } from './canvas-model';
import type { HoveredButton } from './boy-model';

// ─── Lights ──────────────────────────────────────────────────────────────────
function SceneLights() {
  return (
    <>
      {/* Soft ambient fill */}
      <ambientLight intensity={1.10} color="#ffffff" />
      {/* Key light — warm from upper-front-right */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.55}
        color="#FFF3E0"
      />
      {/* Green fill from left */}
      <pointLight position={[-4, 3, 4]} intensity={0.80} color="#B7E4C7" />
      {/* Soft rim from below */}
      <pointLight position={[0, -3, 3]} intensity={0.30} color="#FFFFFF" />
    </>
  );
}

// ─── Ground shadow disc ───────────────────────────────────────────────────────
function GroundDisc() {
  return (
    <mesh position={[0.5, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.9, 32]} />
      <meshStandardMaterial
        color="#2D6A4F"
        transparent
        opacity={0.10}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Ambient sparkles (lightweight points) ───────────────────────────────────
function Sparkles() {
  const COUNT  = 28;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 5;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2 - 1;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#74C69D"
        transparent
        opacity={0.30}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Scene root ───────────────────────────────────────────────────────────────
function Scene({ hoveredButton }: { hoveredButton: HoveredButton }) {
  return (
    <>
      <SceneLights />
      <Sparkles />
      <GroundDisc />

      {/* Boy: centred slightly right of canvas */}
      <group position={[1.05, -0.20, 0]}>
        <BoyModel hovered={hoveredButton} />
      </group>

      {/* Canvas + Easel: left of boy */}
      <CanvasModel hovered={hoveredButton} />
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
interface HeroSceneProps {
  hoveredButton: HoveredButton;
}

export function HeroScene({ hoveredButton }: HeroSceneProps) {
  return (
    <Canvas
      style={{ pointerEvents: 'none', background: 'transparent' }}
      camera={{ position: [0, 0, 5.2], fov: 48, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      gl={{
        antialias:       true,
        alpha:           true,
        powerPreference: 'high-performance',
        stencil:         false,
        depth:           true,
        toneMapping:     THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      <Suspense fallback={null}>
        <Scene hoveredButton={hoveredButton} />
      </Suspense>
    </Canvas>
  );
}
