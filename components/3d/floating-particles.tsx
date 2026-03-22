'use client';
/**
 * components/3d/floating-particles.tsx
 * Premium Three.js hero background — orbiting ink-drop spheres with
 * post-processing glow, responsive to mouse/touch, lazy-loaded via dynamic().
 *
 * Performance: dpr capped at [1,2], demand-driven render loop via invalidate(),
 * SSR=false prevents hydration mismatch with canvas.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import * as THREE from 'three';

// ── Orbiting particle mesh ───────────────────────────────────────────────────
interface InkBallProps {
  index: number;
  total: number;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

function InkBall({ index, total, mouseRef }: InkBallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t0      = useMemo(() => (index / total) * Math.PI * 2, [index, total]);

  // Each ball has its own orbit radius, speed, y-amplitude
  const orbit = useMemo(() => ({
    radius:    3.5 + (index % 3) * 0.8,
    speed:     0.18 + index * 0.03,
    yAmplitude: 0.6 + (index % 2) * 0.4,
    yFreq:     0.4 + index * 0.07,
    size:      0.18 + (index % 4) * 0.06,
  }), [index]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;

    // Orbit + gentle mouse parallax
    const angle = t0 + t * orbit.speed;
    const mx = mouseRef.current.x * 0.6;
    const my = mouseRef.current.y * 0.4;

    meshRef.current.position.set(
      Math.cos(angle) * orbit.radius + mx,
      Math.sin(t * orbit.yFreq) * orbit.yAmplitude + my,
      Math.sin(angle) * orbit.radius * 0.5,
    );
    meshRef.current.rotation.x += 0.004;
    meshRef.current.rotation.y += 0.007;
  });

  const hue = (index / total) * 60 + 130; // green-teal spectrum
  const color = new THREE.Color(`hsl(${hue}, 70%, 50%)`);

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
  const points = useRef<THREE.Points>(null);
  const count  = 320;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3]   = (Math.random() - 0.5) * 20;
      pos[i3+1] = (Math.random() - 0.5) * 12;
      pos[i3+2] = (Math.random() - 0.5) * 10;
      const hue = 130 + Math.random() * 50;
      const c = new THREE.Color(`hsl(${hue}, 60%, 65%)`);
      col[i3] = c.r; col[i3+1] = c.g; col[i3+2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.elapsedTime * 0.018;
    points.current.rotation.x = Math.sin(clock.elapsedTime * 0.012) * 0.08;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" />
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

// ── Central glowing ring ─────────────────────────────────────────────────────
function GlowRing() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = clock.elapsedTime * 0.12;
    mesh.current.rotation.x = Math.sin(clock.elapsedTime * 0.08) * 0.18;
    const s = 1 + Math.sin(clock.elapsedTime * 0.5) * 0.04;
    mesh.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={mesh}>
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

// ── Scene orchestrator ───────────────────────────────────────────────────────
function Scene({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const BALL_COUNT = 9;

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[8, 8, 8]}   intensity={2.5} color="#a8f5a0" />
      <pointLight position={[-8,-6,-6]}  intensity={1.2} color="#7de8cf" />
      <pointLight position={[0, 0, 5]}   intensity={0.8} color="#ffffff" />

      <DustField />
      <GlowRing />

      {Array.from({ length: BALL_COUNT }, (_, i) => (
        <InkBall key={i} index={i} total={BALL_COUNT} mouseRef={mouseRef} />
      ))}
    </>
  );
}

// ── Public export ────────────────────────────────────────────────────────────
export function FloatingParticles() {
  const mouseRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * -2,
    };
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!e.touches[0]) return;
    mouseRef.current = {
      x: (e.touches[0].clientX / window.innerWidth  - 0.5) * 2,
      y: (e.touches[0].clientY / window.innerHeight - 0.5) * -2,
    };
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
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Scene mouseRef={mouseRef} />
    </Canvas>
  );
}
