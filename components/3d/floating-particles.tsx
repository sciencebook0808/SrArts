'use client';
/**
 * components/3d/floating-particles.tsx
 *
 * Premium Three.js hero background — orbiting spheres, particle dust, glow ring.
 * Mouse + touch parallax. Lazy-loaded via next/dynamic — zero SSR impact.
 *
 * ── BufferAttribute API (R3F v9, verified from official docs March 2026) ──────
 *
 * Official R3F docs (r3f.docs.pmnd.rs/api/objects):
 *
 *   <bufferGeometry>
 *     <bufferAttribute attach="attributes-position" args={[v, 3]} />
 *   </bufferGeometry>
 *
 * args={[TypedArray, itemSize]} passes constructor arguments to:
 *   new THREE.BufferAttribute(array, itemSize)
 *
 * This is the ONLY correctly-typed pattern. Do NOT use count/array/itemSize
 * as individual JSX props — THREE.BufferAttribute.count is a readonly getter
 * and causes a TypeScript strict-mode error.
 *
 * ── Verified compatible with ──────────────────────────────────────────────────
 *   @react-three/fiber  ^9.5.0
 *   three               ^0.182.0
 *   TypeScript          strict mode
 *   Next.js             16 (SSR=false via dynamic())
 */
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import * as THREE from 'three';

// ── Types ────────────────────────────────────────────────────────────────────
interface MouseState {
  x: number;
  y: number;
}

interface InkBallProps {
  index: number;
  total: number;
  mouseRef: React.MutableRefObject<MouseState>;
}

// ── Orbiting ink sphere ──────────────────────────────────────────────────────
function InkBall({ index, total, mouseRef }: InkBallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t0      = useMemo(() => (index / total) * Math.PI * 2, [index, total]);

  const orbit = useMemo(() => ({
    radius:     3.5 + (index % 3) * 0.8,
    speed:      0.18 + index * 0.03,
    yAmplitude: 0.6  + (index % 2) * 0.4,
    yFreq:      0.4  + index * 0.07,
    size:       0.18 + (index % 4) * 0.06,
  }), [index]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t     = clock.elapsedTime;
    const angle = t0 + t * orbit.speed;
    meshRef.current.position.set(
      Math.cos(angle) * orbit.radius + mouseRef.current.x * 0.6,
      Math.sin(t * orbit.yFreq) * orbit.yAmplitude + mouseRef.current.y * 0.4,
      Math.sin(angle) * orbit.radius * 0.5,
    );
    meshRef.current.rotation.x += 0.004;
    meshRef.current.rotation.y += 0.007;
  });

  const hue   = (index / total) * 60 + 130;
  const color = useMemo(() => new THREE.Color(`hsl(${hue}, 70%, 50%)`), [hue]);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[orbit.size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.45}
        metalness={0.25}
        roughness={0.35}
        transparent
        opacity={0.88}
      />
    </mesh>
  );
}

// ── Particle dust field ──────────────────────────────────────────────────────
function DustField() {
  const pointsRef = useRef<THREE.Points>(null);
  const COUNT     = 320;

  // Build typed arrays once — memoised so they don't regenerate on re-render
  const { positions, colors } = useMemo<{
    positions: Float32Array;
    colors: Float32Array;
  }>(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const tmp = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3]   = (Math.random() - 0.5) * 20;
      pos[i3+1] = (Math.random() - 0.5) * 12;
      pos[i3+2] = (Math.random() - 0.5) * 10;

      tmp.setHSL((130 + Math.random() * 50) / 360, 0.6, 0.65);
      col[i3] = tmp.r; col[i3+1] = tmp.g; col[i3+2] = tmp.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = clock.elapsedTime * 0.018;
    pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.012) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/*
         * args={[array, itemSize]} → new THREE.BufferAttribute(positions, 3)
         * This is the documented, type-safe R3F pattern.
         * Source: r3f.docs.pmnd.rs/api/objects
         */}
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// ── Central glow ring ────────────────────────────────────────────────────────
function GlowRing() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.z = t * 0.12;
    meshRef.current.rotation.x = Math.sin(t * 0.08) * 0.18;
    const s = 1 + Math.sin(t * 0.5) * 0.04;
    meshRef.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[2.2, 0.018, 16, 120]} />
      <meshStandardMaterial
        color="#52c41a"
        emissive="#52c41a"
        emissiveIntensity={1.2}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

// ── Scene ────────────────────────────────────────────────────────────────────
interface SceneProps {
  mouseRef: React.MutableRefObject<MouseState>;
}

function Scene({ mouseRef }: SceneProps) {
  const BALL_COUNT = 9;
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[ 8,  8,  8]} intensity={2.5} color="#a8f5a0" />
      <pointLight position={[-8, -6, -6]} intensity={1.2} color="#7de8cf" />
      <pointLight position={[ 0,  0,  5]} intensity={0.8} color="#ffffff" />
      <DustField />
      <GlowRing />
      {Array.from({ length: BALL_COUNT }, (_, i) => (
        <InkBall key={i} index={i} total={BALL_COUNT} mouseRef={mouseRef} />
      ))}
    </>
  );
}

// ── Public export (default-exported so dynamic() can import it) ───────────────
export function FloatingParticles() {
  const mouseRef = useRef<MouseState>({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * -2;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    mouseRef.current.x = (touch.clientX / window.innerWidth  - 0.5) * 2;
    mouseRef.current.y = (touch.clientY / window.innerHeight - 0.5) * -2;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [onMouseMove, onTouchMove]);

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 10], fov: 50 }}
      dpr={[1, 2]}
      gl={{
        antialias:       true,
        alpha:           true,
        powerPreference: 'high-performance',
      }}
    >
      <Scene mouseRef={mouseRef} />
    </Canvas>
  );
}
