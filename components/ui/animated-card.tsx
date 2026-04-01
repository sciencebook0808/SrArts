'use client';
/**
 * components/ui/animated-card.tsx
 *
 * Physics-based card with:
 *  – Lift on hover (spring, not CSS transition for natural feel)
 *  – Border glow (primary color bleeds to border)
 *  – Image slot with zoom effect
 *  – Click ripple (Framer Motion tap)
 *
 * Tool: Framer Motion (best for component-level spring physics)
 *
 * Usage:
 *  <AnimatedCard>
 *    <AnimatedCard.Image src="..." alt="..." />
 *    <AnimatedCard.Body>...</AnimatedCard.Body>
 *  </AnimatedCard>
 */

'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';

// ─── Root card ────────────────────────────────────────────────────────────────
interface CardProps {
  children:  React.ReactNode;
  className?: string;
  tilt?:     boolean;  // enable subtle 3D tilt on mouse move
}

function Card({ children, className = '', tilt = false }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX    = useMotionValue(0);
  const rotY    = useMotionValue(0);
  const sRotX   = useSpring(rotX, { stiffness: 280, damping: 28 });
  const sRotY   = useSpring(rotY, { stiffness: 280, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;
    const rect   = cardRef.current.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    rotX.set(((e.clientY - cy) / rect.height) * -10);
    rotY.set(((e.clientX - cx) / rect.width)  *  10);
  };

  const handleMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={['card-base overflow-hidden relative', className].join(' ')}
      style={tilt ? { rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d' } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y:          -7,
        boxShadow:  '0 20px 50px rgba(27,67,50,0.13), 0 4px 14px rgba(27,67,50,0.07)',
        borderColor:'oklch(0.85 0.06 150)',
        transition: { type: 'spring', stiffness: 360, damping: 26 },
      }}
      whileTap={{ scale: 0.985 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Image slot ───────────────────────────────────────────────────────────────
interface CardImageProps {
  src:    string;
  alt:    string;
  aspectRatio?: string;
}

function CardImage({ src, alt, aspectRatio = '4/3' }: CardImageProps) {
  return (
    <div
      className="relative w-full overflow-hidden bg-accent-subtle"
      style={{ aspectRatio }}
    >
      <motion.div
        className="absolute inset-0"
        whileHover={{ scale: 1.07 }}
        transition={{ duration: 0.5, ease: [0.37, 0, 0.63, 1] as const }}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
      </motion.div>
    </div>
  );
}

// ─── Body slot ────────────────────────────────────────────────────────────────
function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={['p-5', className].join(' ')}>{children}</div>;
}

// ─── Compose ─────────────────────────────────────────────────────────────────
const AnimatedCard = Object.assign(Card, {
  Image: CardImage,
  Body:  CardBody,
});

export { AnimatedCard };
