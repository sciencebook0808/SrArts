'use client';
/**
 * components/3d/floating-particles.tsx  — v12 redesign (March 2026)
 *
 * PROBLEM FIXED:
 *  Black/dark instanced spheres were rendering with improper lighting and
 *  opacity, visually covering hero text. Canvas had no pointer-events guard.
 *
 * SOLUTION:
 *  1. Canvas: pointer-events: none  → UI fully interactive underneath
 *  2. Particles replaced with soft, very-light ambient sparkles (opacity 0.28)
 *  3. Added procedural 3D artist character (bottom-right, cartoon-style)
 *     - Sitting pose holding paintbrush + palette
 *     - Idle: breathing, head bob, brush painting arc
 *     - Gesture: every ~10s right arm extends toward viewer (CTA hint)
 *  4. MeshToonMaterial throughout → flat-shaded cartoon look, no dark shadows
 *  5. DustField and GlowRing removed (were causing dark rendering artifacts)
 *
 * PERFORMANCE:
 *  - 70 sparkle points vs 1200 instanced spheres (−94% draw calls)
 *  - All materials created once in useMemo
 *  - Character hidden on mobile (< 768px) to avoid text overlap
 *  - DPR capped at 1.5 desktop / 1.0 mobile
 *
 * GLTF SWAP-IN (optional):
 *  To replace the procedural character with a real model from Sketchfab/Poly Pizza:
 *    1. Download a low-poly .glb file, place in /public/models/artist.glb
 *    2. Import { useGLTF, useAnimations } from '@react-three/drei'
 *    3. Swap <ArtistCharacter> with <group><primitive object={scene} /></group>
 *    4. Wire Mixamo animations via useAnimations()
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// ─── Tiny math helper ─────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Toon material factory (creates once, stable ref) ─────────────────────────
function toon(hex: string): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ color: hex });
}
function basic(hex: string, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: hex,
    transparent: opacity < 1,
    opacity,
  });
}

// ─── Ambient sparkles ─────────────────────────────────────────────────────────
// Replaces the heavy instanced particle system. 70 points at 0.28 opacity.
function AmbientSparkles() {
  const ref   = useRef<THREE.Points>(null);
  const COUNT = 70;

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r   = 2.5 + Math.random() * 5.5;
      arr[i*3]   = Math.cos(ang) * r + (Math.random() - 0.5) * 1.5;
      arr[i*3+1] = (Math.random() - 0.5) * 5.5;
      arr[i*3+2] = (Math.random() - 0.5) * 3 - 1;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.rotation.y = t * 0.006;
    ref.current.position.y = Math.sin(t * 0.12) * 0.07;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#52b788"
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Floating paint drops (decorative accent) ─────────────────────────────────
function PaintDrops() {
  const ref = useRef<THREE.Group>(null);

  interface DropData {
    pos: [number, number, number];
    mat: THREE.MeshToonMaterial;
    scale: number;
    freq: number;
    phase: number;
  }

  const drops = useMemo<DropData[]>(() => {
    const palette = ['#74c69d', '#52b788', '#95d5b2', '#b7e4c7', '#40916c', '#1b4332'];
    return Array.from({ length: 9 }, (_, i) => ({
      pos: [
        -4.5 + i * 1.1 + (Math.random() - 0.5) * 0.6,
        -1.5 + (Math.random() - 0.5) * 2.5,
        -1   + (Math.random() - 0.5) * 1.5,
      ] as [number, number, number],
      mat:   new THREE.MeshToonMaterial({
        color:       palette[i % palette.length]!,
        transparent: true,
        opacity:     0.32 + Math.random() * 0.12,
      }),
      scale: 0.04 + Math.random() * 0.055,
      freq:  0.35 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((child, i) => {
      const d = drops[i];
      if (!d) return;
      child.position.y = d.pos[1] + Math.sin(t * d.freq + d.phase) * 0.22;
      child.rotation.z = t * 0.22 * (i % 2 === 0 ? 1 : -1);
    });
  });

  return (
    <group ref={ref}>
      {drops.map((d, i) => (
        <mesh key={i} material={d.mat} position={d.pos} scale={d.scale}>
          <sphereGeometry args={[1, 7, 7]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Artist character materials (created once via useMemo) ────────────────────
function useArtistMaterials() {
  return useMemo(() => ({
    skin:       toon('#F5C8A0'),
    hair:       toon('#3C1A09'),
    shirt:      toon('#2D6A4F'),    // green apron
    pants:      toon('#1B3A4B'),
    shoe:       toon('#2C1A0E'),
    brush:      toon('#7B3C10'),
    metal:      toon('#BDBDBD'),
    bristle:    toon('#2A1408'),
    beret:      toon('#1B4332'),
    beretBtn:   toon('#52B788'),
    palette:    toon('#C8963A'),
    eye:        basic('#2A1408'),
    eyeShine:   basic('#FFFFFF'),
    cheek:      basic('#FFB0A0', 0.52),
    smudge0:    basic('#E63946', 0.65),
    smudge1:    basic('#2A9D8F', 0.65),
    smudge2:    basic('#E9C46A', 0.65),
    paint0:     basic('#E63946'),
    paint1:     basic('#F4A261'),
    paint2:     basic('#2A9D8F'),
    paint3:     basic('#52B788'),
    thumbHole:  basic('#9B6E28'),
    brushTip:   basic('#E63946'),
    smile:      basic('#B86040'),
  }), []);
}

// ─── Procedural artist character ──────────────────────────────────────────────
function ArtistCharacter({ isMobile }: { isMobile: boolean }) {
  const m = useArtistMaterials();

  const groupRef    = useRef<THREE.Group>(null);
  const headGroup   = useRef<THREE.Group>(null);
  const bodyMesh    = useRef<THREE.Mesh>(null);
  const rArmGroup   = useRef<THREE.Group>(null);
  const lArmGroup   = useRef<THREE.Group>(null);
  const nextGesture = useRef(8 + Math.random() * 4);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Float
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.50) * 0.048;
    }
    // Breathe
    if (bodyMesh.current) {
      bodyMesh.current.scale.y = 1 + Math.sin(t * 1.85) * 0.012;
    }
    // Head bob + gentle look-around
    if (headGroup.current) {
      headGroup.current.position.y = 0.80 + Math.sin(t * 1.85) * 0.009;
      headGroup.current.rotation.z = Math.sin(t * 0.52) * 0.032;
      headGroup.current.rotation.y = Math.sin(t * 0.38) * 0.048;
    }
    // Right arm — painting arc
    if (rArmGroup.current) {
      const baseX = -0.52 + Math.sin(t * 2.1) * 0.17;
      const baseZ = -0.28 + Math.sin(t * 1.05) * 0.042;

      if (t > nextGesture.current) {
        const gp = lerp(0, 1, (t - nextGesture.current) / 1.6);
        if (gp < 1.0) {
          rArmGroup.current.rotation.x = baseX + Math.sin(gp * Math.PI) * -0.9;
          rArmGroup.current.rotation.z = baseZ + Math.sin(gp * Math.PI) * -0.3;
        } else {
          rArmGroup.current.rotation.x = baseX;
          rArmGroup.current.rotation.z = baseZ;
          if (gp > 1.12) nextGesture.current = t + 8 + Math.random() * 7;
        }
      } else {
        rArmGroup.current.rotation.x = baseX;
        rArmGroup.current.rotation.z = baseZ;
      }
    }
    // Left arm — gentle palette sway
    if (lArmGroup.current) {
      lArmGroup.current.rotation.x = -0.26 + Math.sin(t * 0.88) * 0.035;
    }
  });

  // Hidden on mobile — would overlap text in portrait layout
  if (isMobile) return null;

  return (
    <group ref={groupRef} position={[3.5, -1.9, 0.3]} rotation={[0, -0.38, 0]} scale={0.92}>

      {/* ── Torso ─────────────────────────────── */}
      <mesh ref={bodyMesh} material={m.shirt} position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.52, 8]} />
      </mesh>
      {/* Paint smudges on apron */}
      <mesh material={m.smudge0} position={[-0.06, 0.36, 0.21]}>
        <sphereGeometry args={[0.025, 5, 5]} />
      </mesh>
      <mesh material={m.smudge1} position={[0.09, 0.22, 0.21]}>
        <sphereGeometry args={[0.022, 5, 5]} />
      </mesh>
      <mesh material={m.smudge2} position={[-0.11, 0.16, 0.20]}>
        <sphereGeometry args={[0.020, 5, 5]} />
      </mesh>

      {/* ── Hips ──────────────────────────────── */}
      <mesh material={m.pants} position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.20, 0.19, 0.18, 8]} />
      </mesh>

      {/* ── Sitting legs ──────────────────────── */}
      {([-0.12, 0.12] as const).map((x, li) => (
        <group key={li} position={[x, -0.07, 0]} rotation={[0.80, 0, 0]}>
          <mesh material={m.pants}>
            <cylinderGeometry args={[0.085, 0.078, 0.36, 7]} />
          </mesh>
          <group position={[0, -0.21, 0.19]} rotation={[-1.02, 0, 0]}>
            <mesh material={m.pants}>
              <cylinderGeometry args={[0.072, 0.066, 0.30, 7]} />
            </mesh>
            <mesh material={m.shoe} position={[0, -0.17, 0.04]}>
              <boxGeometry args={[0.125, 0.09, 0.195]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ── Right arm (brush) ─────────────────── */}
      <group ref={rArmGroup} position={[0.22, 0.44, 0]} rotation={[-0.52, 0, -0.28]}>
        <mesh material={m.shirt}>
          <cylinderGeometry args={[0.064, 0.056, 0.27, 7]} />
        </mesh>
        <mesh material={m.skin} position={[0, -0.145, 0]}>
          <sphereGeometry args={[0.064, 7, 7]} />
        </mesh>
        <group position={[0.038, -0.235, 0.075]} rotation={[0.27, 0, 0.07]}>
          <mesh material={m.skin}>
            <cylinderGeometry args={[0.053, 0.046, 0.24, 7]} />
          </mesh>
          <mesh material={m.skin} position={[0.018, -0.14, 0.048]}>
            <sphereGeometry args={[0.059, 8, 8]} />
          </mesh>
          {/* Paintbrush */}
          <group position={[0.018, -0.235, 0.095]} rotation={[0.36, 0, -0.11]}>
            <mesh material={m.brush}>
              <cylinderGeometry args={[0.012, 0.010, 0.40, 6]} />
            </mesh>
            <mesh material={m.metal} position={[0, 0.21, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.036, 6]} />
            </mesh>
            <mesh material={m.bristle} position={[0, 0.255, 0]}>
              <coneGeometry args={[0.019, 0.080, 6]} />
            </mesh>
            <mesh material={m.brushTip} position={[0, 0.305, 0]}>
              <sphereGeometry args={[0.010, 5, 5]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ── Left arm (palette) ────────────────── */}
      <group ref={lArmGroup} position={[-0.22, 0.44, 0]} rotation={[-0.26, 0, 0.28]}>
        <mesh material={m.shirt}>
          <cylinderGeometry args={[0.064, 0.056, 0.27, 7]} />
        </mesh>
        <mesh material={m.skin} position={[0, -0.145, 0]}>
          <sphereGeometry args={[0.064, 7, 7]} />
        </mesh>
        <group position={[-0.038, -0.235, 0.075]} rotation={[0.23, 0, -0.06]}>
          <mesh material={m.skin}>
            <cylinderGeometry args={[0.053, 0.046, 0.24, 7]} />
          </mesh>
          <mesh material={m.skin} position={[-0.018, -0.14, 0.048]}>
            <sphereGeometry args={[0.059, 8, 8]} />
          </mesh>
          {/* Palette */}
          <group position={[-0.048, -0.215, 0.095]} rotation={[0.62, 0.16, 0.07]}>
            <mesh material={m.palette}>
              <cylinderGeometry args={[0.12, 0.11, 0.020, 10]} />
            </mesh>
            <mesh material={m.paint0} position={[ 0.052, 0.013,  0.022]}><sphereGeometry args={[0.022, 5, 5]} /></mesh>
            <mesh material={m.paint1} position={[-0.044, 0.013,  0.060]}><sphereGeometry args={[0.020, 5, 5]} /></mesh>
            <mesh material={m.paint2} position={[ 0.070, 0.013, -0.035]}><sphereGeometry args={[0.021, 5, 5]} /></mesh>
            <mesh material={m.paint3} position={[-0.034, 0.013, -0.070]}><sphereGeometry args={[0.020, 5, 5]} /></mesh>
            <mesh material={m.thumbHole} position={[-0.075, 0.011, -0.048]}>
              <cylinderGeometry args={[0.022, 0.022, 0.022, 8]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ── Neck ──────────────────────────────── */}
      <mesh material={m.skin} position={[0, 0.60, 0]}>
        <cylinderGeometry args={[0.070, 0.074, 0.12, 8]} />
      </mesh>

      {/* ── Head ──────────────────────────────── */}
      <group ref={headGroup} position={[0, 0.80, 0]}>
        {/* Face */}
        <mesh material={m.skin}>
          <sphereGeometry args={[0.245, 16, 16]} />
        </mesh>
        {/* Hair cap */}
        <mesh material={m.hair} position={[0, 0.068, -0.018]} scale={[1.02, 0.68, 1.02]}>
          <sphereGeometry args={[0.252, 16, 16]} />
        </mesh>

        {/* Eyes */}
        {([-0.098, 0.098] as const).map((x, ei) => (
          <group key={ei} position={[x, 0.038, 0.220]}>
            <mesh material={m.eye}><sphereGeometry args={[0.034, 8, 8]} /></mesh>
            <mesh material={m.eyeShine} position={[0.011, 0.012, 0.026]}>
              <sphereGeometry args={[0.012, 5, 5]} />
            </mesh>
          </group>
        ))}

        {/* Eyebrows */}
        {([-0.098, 0.098] as const).map((x, bi) => (
          <mesh key={bi} material={m.hair} position={[x, 0.108, 0.225]} rotation={[0, 0, bi === 0 ? 0.18 : -0.18]}>
            <boxGeometry args={[0.085, 0.018, 0.014]} />
          </mesh>
        ))}

        {/* Nose */}
        <mesh material={m.skin} position={[0, -0.014, 0.244]} scale={[0.72, 1, 0.48]}>
          <sphereGeometry args={[0.032, 7, 7]} />
        </mesh>

        {/* Smile — arc of 5 dots forming a parabola */}
        {Array.from({ length: 5 }, (_, i) => {
          const tt = (i / 4) - 0.5;
          return (
            <mesh key={i} material={m.smile} position={[tt * 0.098, -0.086 + tt * tt * 0.028, 0.242]}>
              <sphereGeometry args={[0.012, 5, 5]} />
            </mesh>
          );
        })}

        {/* Blush */}
        {([-0.168, 0.168] as const).map((x, ci) => (
          <mesh key={ci} material={m.cheek} position={[x, -0.016, 0.190]} scale={[1.12, 0.72, 0.32]}>
            <sphereGeometry args={[0.042, 6, 6]} />
          </mesh>
        ))}

        {/* Ears */}
        {([-0.248, 0.248] as const).map((x, ei) => (
          <mesh key={ei} material={m.skin} position={[x, 0, 0]} scale={[0.44, 0.74, 0.44]}>
            <sphereGeometry args={[0.070, 8, 8]} />
          </mesh>
        ))}

        {/* Beret */}
        <group position={[0.036, 0.22, -0.026]} rotation={[0.08, 0.16, 0.26]}>
          <mesh material={m.beret}>
            <cylinderGeometry args={[0.224, 0.205, 0.072, 12]} />
          </mesh>
          <mesh material={m.beret} position={[0, 0.028, 0.028]} scale={[0.90, 0.52, 0.90]}>
            <sphereGeometry args={[0.215, 12, 12]} />
          </mesh>
          <mesh material={m.beretBtn} position={[-0.036, 0.125, 0.052]}>
            <sphereGeometry args={[0.020, 6, 6]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─── Lighting ─────────────────────────────────────────────────────────────────
function Lights() {
  return (
    <>
      <ambientLight intensity={1.05} color="#ffffff" />
      <directionalLight
        position={[5, 7, 6]}
        intensity={1.6}
        color="#ffe8d0"
        castShadow={false}
      />
      <pointLight position={[-4, 3, 5]} intensity={0.70} color="#b7e4c7" />
      <pointLight position={[ 2, -2, 4]} intensity={0.35} color="#ffffff" />
    </>
  );
}

// ─── Scroll / mouse state (shared refs, no re-renders) ────────────────────────
interface MouseState  { x: number; y: number }
interface ScrollState { y: number }

// ─── Camera parallax ─────────────────────────────────────────────────────────
function CameraRig({ mouseRef }: { mouseRef: React.MutableRefObject<MouseState> }) {
  useFrame(({ camera }) => {
    const tx = mouseRef.current.x * 0.22;
    const ty = mouseRef.current.y * 0.16;
    camera.position.x += (tx - camera.position.x) * 0.04;
    camera.position.y += (ty - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Scene root ───────────────────────────────────────────────────────────────
function Scene({
  mouseRef,
  isMobile,
}: {
  mouseRef:  React.MutableRefObject<MouseState>;
  isMobile:  boolean;
}) {

  return (
    <>
      <Lights />
      <AmbientSparkles />
      <PaintDrops />
      <ArtistCharacter isMobile={isMobile} />
      <CameraRig mouseRef={mouseRef} />
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
// Keeps the same export name so hero-section.tsx needs no changes.
export function FloatingParticles() {
  const mouseRef  = useRef<MouseState>({ x: 0, y: 0 });
  const isMobile  = typeof window !== 'undefined' && window.innerWidth < 768;

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * -2;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  return (
    <Canvas
      className="absolute inset-0"
      style={{ pointerEvents: 'none' }}   // ← KEY FIX: never intercept UI clicks
      camera={{ position: [0, 0, 8], fov: 52 }}
      dpr={[1, isMobile ? 1 : 1.5]}
      gl={{
        antialias:       !isMobile,
        alpha:           true,            // transparent canvas background
        powerPreference: 'high-performance',
        stencil:         false,
        depth:           true,
      }}
    >
      <Scene mouseRef={mouseRef} isMobile={isMobile} />
    </Canvas>
  );
}
