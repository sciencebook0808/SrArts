'use client';
/**
 * components/3d/boy-model.tsx
 *
 * Procedural low-poly cartoon artist boy.
 *
 * IDLE:      Gentle float + left arm slow wave (loops forever)
 * GALLERY:   Only ambient particles react — boy stays neutral
 * COMMISSION: Boy rotates slightly toward canvas, right arm paints arc
 *
 * All geometry: pure Three.js primitives, zero external model loading.
 * Toon shading via MeshToonMaterial for a hand-drawn illustration feel.
 *
 * GSAP handles state transitions (rotation, arm angles).
 * useFrame handles continuous idle oscillation.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';

export type HoveredButton = 'gallery' | 'commission' | null;

// ─── Stable material factory ────────────────────────────────────────────────
function toon(hex: string, opts: { transparent?: boolean; opacity?: number } = {}) {
  return new THREE.MeshToonMaterial({ color: hex, ...opts });
}
function basic(hex: string, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color: hex,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity < 1 ? false : true,
  });
}

function useMaterials() {
  return useMemo(() => ({
    skin:       toon('#FFCBA4'),
    hair:       toon('#3B1A08'),
    shirt:      toon('#2D6A4F'),
    pants:      toon('#1B3A4B'),
    shoe:       toon('#2C1810'),
    brush:      toon('#6B3410'),
    metal:      toon('#CCCCCC'),
    bristle:    toon('#1A0C04'),
    beret:      toon('#1B4332'),
    beretBtn:   toon('#52B788'),
    palette:    toon('#C8963A'),
    eye:        basic('#1A0C04'),
    eyeWhite:   basic('#FFFFFF'),
    eyeShine:   basic('#FFFFFF', 0.9),
    cheek:      basic('#FFB0A0', 0.45),
    smile:      basic('#9B5030'),
    smudgeR:    basic('#E63946', 0.6),
    smudgeT:    basic('#2A9D8F', 0.6),
    smudgeY:    basic('#F4A261', 0.6),
    paint0:     basic('#E63946'),
    paint1:     basic('#F4A261'),
    paint2:     basic('#2A9D8F'),
    paint3:     basic('#52B788'),
    brushTip:   basic('#CC2233'),
  }), []);
}

// ─── Component ────────────────────────────────────────────────────────────────
interface BoyModelProps {
  hovered: HoveredButton;
}

export function BoyModel({ hovered }: BoyModelProps) {
  const m = useMaterials();

  // Refs for animated parts
  const rootRef      = useRef<THREE.Group>(null);
  const bodyRef      = useRef<THREE.Mesh>(null);
  const headRef      = useRef<THREE.Group>(null);
  const lArmRef      = useRef<THREE.Group>(null); // waving arm
  const rArmRef      = useRef<THREE.Group>(null); // painting arm
  const rForeRef     = useRef<THREE.Group>(null); // forearm for paint arc

  // Continuous idle rotation state (not affected by GSAP)
  const idleYRef = useRef(0);

  // GSAP: respond to hovered changes
  useEffect(() => {
    const root = rootRef.current;
    const rArm = rArmRef.current;
    const rFore = rForeRef.current;
    if (!root || !rArm || !rFore) return;

    if (hovered === 'commission') {
      // Boy turns slightly toward canvas (canvas is to his left)
      gsap.to(idleYRef, { current: -0.42, duration: 0.7, ease: 'power2.out' });
      // Right arm lifts to paint
      gsap.to(rArm.rotation, { x: -0.9, z: -0.2, duration: 0.65, ease: 'power2.out' });
    } else {
      // Back to default
      gsap.to(idleYRef, { current: 0, duration: 0.7, ease: 'power2.out' });
      gsap.to(rArm.rotation, { x: -0.38, z: -0.25, duration: 0.6, ease: 'power2.out' });
    }
  }, [hovered]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Float
    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(t * 0.55) * 0.055;
      rootRef.current.rotation.y = idleYRef.current;
    }

    // Breathe
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.9) * 0.011;
    }

    // Head gentle bob
    if (headRef.current) {
      headRef.current.position.y = 0.82 + Math.sin(t * 1.9) * 0.009;
      headRef.current.rotation.z = Math.sin(t * 0.55) * 0.028;
      headRef.current.rotation.y = Math.sin(t * 0.42) * 0.042;
    }

    // LEFT arm: idle wave
    if (lArmRef.current && hovered !== 'commission') {
      lArmRef.current.rotation.z = 0.32 + Math.sin(t * 2.2) * 0.38;
      lArmRef.current.rotation.x = -0.18 + Math.sin(t * 1.1) * 0.06;
    }

    // RIGHT arm: paint arc when commissions hovered
    if (rForeRef.current && hovered === 'commission') {
      rForeRef.current.rotation.x = Math.sin(t * 2.8) * 0.28;
    }

    // RIGHT arm idle bob
    if (rArmRef.current && hovered !== 'commission') {
      rArmRef.current.rotation.x += ((-0.38 - rArmRef.current.rotation.x) * 0.04)
        + Math.sin(t * 2.0) * 0.006;
    }
  });

  // Title chars for visual interest
  const SMILE_DOTS = Array.from({ length: 5 }, (_, i) => {
    const tt = (i / 4) - 0.5;
    return [tt * 0.096, -0.088 + tt * tt * 0.025, 0.243] as [number, number, number];
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]}>

      {/* ── Torso ──────────────────────────────────────────────────────── */}
      <mesh ref={bodyRef} material={m.shirt} position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.52, 8]} />
      </mesh>

      {/* Apron smudges */}
      <mesh material={m.smudgeR} position={[-0.06, 0.37, 0.21]}>
        <sphereGeometry args={[0.024, 5, 5]} />
      </mesh>
      <mesh material={m.smudgeT} position={[0.09, 0.23, 0.21]}>
        <sphereGeometry args={[0.022, 5, 5]} />
      </mesh>
      <mesh material={m.smudgeY} position={[-0.10, 0.16, 0.20]}>
        <sphereGeometry args={[0.019, 5, 5]} />
      </mesh>

      {/* ── Hips ──────────────────────────────────────────────────────── */}
      <mesh material={m.pants} position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.20, 0.19, 0.18, 8]} />
      </mesh>

      {/* ── Sitting legs ──────────────────────────────────────────────── */}
      {([-0.115, 0.115] as const).map((x, li) => (
        <group key={li} position={[x, -0.08, 0]} rotation={[0.80, 0, 0]}>
          <mesh material={m.pants}>
            <cylinderGeometry args={[0.082, 0.076, 0.34, 7]} />
          </mesh>
          <group position={[0, -0.20, 0.18]} rotation={[-1.04, 0, 0]}>
            <mesh material={m.pants}>
              <cylinderGeometry args={[0.070, 0.064, 0.28, 7]} />
            </mesh>
            <mesh material={m.shoe} position={[0, -0.17, 0.04]}>
              <boxGeometry args={[0.122, 0.088, 0.190]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ── Left arm (waves on idle) ──────────────────────────────────── */}
      <group ref={lArmRef} position={[-0.22, 0.44, 0]} rotation={[-0.18, 0, 0.32]}>
        <mesh material={m.shirt}>
          <cylinderGeometry args={[0.062, 0.055, 0.26, 7]} />
        </mesh>
        <mesh material={m.skin} position={[0, -0.14, 0]}>
          <sphereGeometry args={[0.062, 7, 7]} />
        </mesh>
        <group position={[-0.032, -0.22, 0.07]} rotation={[0.22, 0, -0.06]}>
          <mesh material={m.skin}>
            <cylinderGeometry args={[0.052, 0.046, 0.22, 7]} />
          </mesh>
          <mesh material={m.skin} position={[-0.016, -0.132, 0.045]}>
            <sphereGeometry args={[0.058, 8, 8]} />
          </mesh>
          {/* Palette */}
          <group position={[-0.045, -0.20, 0.088]} rotation={[0.58, 0.14, 0.06]}>
            <mesh material={m.palette}>
              <cylinderGeometry args={[0.110, 0.100, 0.018, 10]} />
            </mesh>
            <mesh material={m.paint0} position={[ 0.048, 0.012,  0.020]}><sphereGeometry args={[0.020, 5, 5]} /></mesh>
            <mesh material={m.paint1} position={[-0.040, 0.012,  0.055]}><sphereGeometry args={[0.018, 5, 5]} /></mesh>
            <mesh material={m.paint2} position={[ 0.065, 0.012, -0.032]}><sphereGeometry args={[0.019, 5, 5]} /></mesh>
            <mesh material={m.paint3} position={[-0.030, 0.012, -0.063]}><sphereGeometry args={[0.018, 5, 5]} /></mesh>
          </group>
        </group>
      </group>

      {/* ── Right arm (holds brush, paints) ──────────────────────────── */}
      <group ref={rArmRef} position={[0.22, 0.44, 0]} rotation={[-0.38, 0, -0.25]}>
        <mesh material={m.shirt}>
          <cylinderGeometry args={[0.062, 0.055, 0.26, 7]} />
        </mesh>
        <mesh material={m.skin} position={[0, -0.14, 0]}>
          <sphereGeometry args={[0.062, 7, 7]} />
        </mesh>
        <group ref={rForeRef} position={[0.032, -0.22, 0.07]} rotation={[0.25, 0, 0.06]}>
          <mesh material={m.skin}>
            <cylinderGeometry args={[0.052, 0.046, 0.22, 7]} />
          </mesh>
          <mesh material={m.skin} position={[0.016, -0.132, 0.045]}>
            <sphereGeometry args={[0.058, 8, 8]} />
          </mesh>
          {/* Paintbrush */}
          <group position={[0.016, -0.22, 0.088]} rotation={[0.32, 0, -0.10]}>
            <mesh material={m.brush}>
              <cylinderGeometry args={[0.011, 0.010, 0.38, 6]} />
            </mesh>
            <mesh material={m.metal} position={[0, 0.20, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.034, 6]} />
            </mesh>
            <mesh material={m.bristle} position={[0, 0.245, 0]}>
              <coneGeometry args={[0.018, 0.076, 6]} />
            </mesh>
            <mesh material={m.brushTip} position={[0, 0.292, 0]}>
              <sphereGeometry args={[0.010, 5, 5]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ── Neck ──────────────────────────────────────────────────────── */}
      <mesh material={m.skin} position={[0, 0.61, 0]}>
        <cylinderGeometry args={[0.068, 0.072, 0.11, 8]} />
      </mesh>

      {/* ── Head group ────────────────────────────────────────────────── */}
      <group ref={headRef} position={[0, 0.82, 0]}>

        {/* Face */}
        <mesh material={m.skin}>
          <sphereGeometry args={[0.240, 16, 16]} />
        </mesh>

        {/* Hair cap */}
        <mesh material={m.hair} position={[0, 0.065, -0.016]} scale={[1.02, 0.66, 1.02]}>
          <sphereGeometry args={[0.248, 16, 16]} />
        </mesh>

        {/* Eyes */}
        {([-0.096, 0.096] as const).map((x, ei) => (
          <group key={ei} position={[x, 0.038, 0.218]}>
            <mesh material={m.eyeWhite} scale={[1.2, 1.1, 0.8]}>
              <sphereGeometry args={[0.034, 8, 8]} />
            </mesh>
            <mesh material={m.eye} position={[0, 0, 0.016]}>
              <sphereGeometry args={[0.026, 8, 8]} />
            </mesh>
            <mesh material={m.eyeShine} position={[0.010, 0.011, 0.040]}>
              <sphereGeometry args={[0.011, 5, 5]} />
            </mesh>
          </group>
        ))}

        {/* Eyebrows */}
        {([-0.094, 0.094] as const).map((x, bi) => (
          <mesh key={bi} material={m.hair} position={[x, 0.108, 0.222]} rotation={[0, 0, bi === 0 ? 0.20 : -0.20]}>
            <boxGeometry args={[0.080, 0.017, 0.013]} />
          </mesh>
        ))}

        {/* Nose */}
        <mesh material={m.skin} position={[0, -0.014, 0.242]} scale={[0.70, 1, 0.48]}>
          <sphereGeometry args={[0.031, 7, 7]} />
        </mesh>

        {/* Smile dots */}
        {SMILE_DOTS.map(([x, y, z], i) => (
          <mesh key={i} material={m.smile} position={[x, y, z]}>
            <sphereGeometry args={[0.011, 5, 5]} />
          </mesh>
        ))}

        {/* Blush */}
        {([-0.164, 0.164] as const).map((x, ci) => (
          <mesh key={ci} material={m.cheek} position={[x, -0.014, 0.188]} scale={[1.10, 0.70, 0.30]}>
            <sphereGeometry args={[0.040, 6, 6]} />
          </mesh>
        ))}

        {/* Ears */}
        {([-0.244, 0.244] as const).map((x, ei) => (
          <mesh key={ei} material={m.skin} position={[x, 0, 0]} scale={[0.42, 0.72, 0.42]}>
            <sphereGeometry args={[0.068, 8, 8]} />
          </mesh>
        ))}

        {/* Beret */}
        <group position={[0.034, 0.220, -0.022]} rotation={[0.07, 0.15, 0.25]}>
          <mesh material={m.beret}>
            <cylinderGeometry args={[0.220, 0.202, 0.068, 12]} />
          </mesh>
          <mesh material={m.beret} position={[0, 0.026, 0.026]} scale={[0.89, 0.50, 0.89]}>
            <sphereGeometry args={[0.210, 12, 12]} />
          </mesh>
          <mesh material={m.beretBtn} position={[-0.034, 0.118, 0.048]}>
            <sphereGeometry args={[0.019, 6, 6]} />
          </mesh>
        </group>

      </group>
    </group>
  );
}
