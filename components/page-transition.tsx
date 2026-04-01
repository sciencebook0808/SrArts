'use client';
/**
 * components/page-transition.tsx
 *
 * Wraps page content with a smooth fade+slide transition on route change.
 * Uses Framer Motion AnimatePresence + usePathname to detect navigation.
 *
 * Usage: wrap main content in RootLayout (or each page individually):
 *
 *   <PageTransition key={pathname}>
 *     {children}
 *   </PageTransition>
 *
 * Performance:
 *  – Only translates 10px (minimal reflow)
 *  – will-change: opacity, transform on the wrapper
 *  – Duration: 0.38s — perceptually instant but still smooth
 */

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

interface Props { children: React.ReactNode }

const variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

export function PageTransition({ children }: Props) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{
          duration: 0.38,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
