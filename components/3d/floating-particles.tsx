'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

function Particle({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[0.5, 32, 32]}
      position={position}
    >
      <meshStandardMaterial
        color="#52c41a"
        emissive="#52c41a"
        emissiveIntensity={0.5}
        metalness={0.3}
        roughness={0.4}
      />
    </Sphere>
  );
}

function Scene() {
  const pointLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 2;
    }
  }, []);

  // Generate particle positions
  const particles = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 4,
      Math.sin(angle) * radius,
    ] as [number, number, number];
  });

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight ref={pointLightRef} position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#52c41a" />

      {particles.map((pos, i) => (
        <Particle key={i} position={pos} />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
      />
    </>
  );
}

export function FloatingParticles() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 12], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}
