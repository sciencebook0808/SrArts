'use client';
/**
 * components/ui/animated-button.tsx
 *
 * Premium button with physics-based micro-interactions.
 *
 * Variants:
 *  primary   – filled green, glow shadow on hover
 *  secondary – outlined, fill on hover
 *  ghost     – transparent, subtle bg on hover
 *
 * Tool: Framer Motion (perfect for component-level spring animations)
 *
 * Usage:
 *  <AnimatedButton variant="primary" onClick={...}>Commission Now</AnimatedButton>
 *  <AnimatedButton variant="secondary" href="/gallery">View Gallery</AnimatedButton>
 */

import { forwardRef } from 'react';
import Link from 'next/link';
import { motion, HTMLMotionProps } from 'motion/react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  size?:    Size;
  href?:    string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary-light hover:shadow-lg hover:shadow-primary/35',
  secondary:
    'border-2 border-primary text-primary hover:bg-accent-subtle',
  ghost:
    'text-foreground/70 hover:text-primary hover:bg-accent-subtle',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-7 py-3 text-sm gap-2',
  lg: 'px-9 py-4 text-base gap-2.5',
};

export const AnimatedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function AnimatedButton(
    { variant = 'primary', size = 'md', href, loading, children, className = '', ...rest },
    ref
  ) {
    const baseClass = [
      'inline-flex items-center justify-center rounded-full font-semibold',
      'transition-colors duration-200 cursor-pointer select-none relative overflow-hidden',
      'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-3',
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      loading ? 'opacity-60 pointer-events-none' : '',
      className,
    ].join(' ');

    const motionProps = {
      whileHover: { scale: 1.045, y: -2 },
      whileTap:   { scale: 0.96, y: 0 },
      transition: { type: 'spring' as const, stiffness: 420, damping: 22 },
    };

    if (href) {
      return (
        <motion.div {...motionProps}>
          <Link href={href} className={baseClass}>
            {children}
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.button
        ref={ref}
        {...(rest as HTMLMotionProps<'button'>)}
        {...motionProps}
        className={baseClass}
        disabled={loading || rest.disabled}
      >
        {/* Ripple layer */}
        <span className="absolute inset-0 rounded-full pointer-events-none" aria-hidden />
        {children}
      </motion.button>
    );
  }
);
