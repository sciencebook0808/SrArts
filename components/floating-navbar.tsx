'use client';
/**
 * components/floating-navbar.tsx
 *
 * Awwwards-grade floating navbar.
 *
 * Features:
 *  ✓ Scroll progress bar (top of viewport, primary color)
 *  ✓ Glassmorphism pill — opacity increases with scroll
 *  ✓ Active link indicator (layoutId spring pill)
 *  ✓ Framer Motion: entrance, hover lift, menu spring
 *  ✓ Mobile: full-screen slide-down with stagger links
 *  ✓ Commission CTA: subtle pulse ring on hover
 *  ✓ Clerk UserButton integrated
 *
 * Tool choices:
 *  Framer Motion → entrance + layout animations (component-level, perfect fit)
 *  CSS only       → scroll progress bar (no lib needed for this)
 *  Lenis          → scroll state (already available via useLenis)
 */

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLenis } from '@/lib/lenis-provider';
import { motion, AnimatePresence, useSpring, useTransform, useScroll } from 'framer-motion';
import { Menu, X, Palette, Users, Brush } from 'lucide-react';
import {
  SignInButton, SignUpButton, UserButton,
  SignedIn, SignedOut,
} from '@clerk/nextjs';

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { label: 'Gallery',   href: '/gallery'   },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Blog',      href: '/blog'      },
  { label: 'About',     href: '/about'     },
];

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[2.5px] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, oklch(0.50 0.17 150), oklch(0.65 0.20 160), oklch(0.55 0.18 145))',
      }}
    />
  );
}

// ─── Desktop nav link with animated underline indicator ───────────────────────
function NavLink({ href, label, icon: Icon, active }: {
  href: string; label: string; icon?: React.ComponentType<{ className?: string }>; active: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
      style={{ color: active ? 'var(--color-primary)' : undefined }}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-full bg-primary/10"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 relative z-10" />}
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function FloatingNavbar() {
  const pathname   = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen,   setIsOpen]   = useState(false);
  const lenis      = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const handler = ({ scroll }: { scroll: number }) => setScrolled(scroll > 40);
    lenis.on('scroll', handler);
    return () => { lenis.off('scroll', handler); };
  }, [lenis]);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  const glassBg = scrolled
    ? 'rgba(255,255,255,0.96)'
    : 'rgba(255,255,255,0.72)';

  const glassShadow = scrolled
    ? '0 8px 36px rgba(0,0,0,0.11), inset 0 1px 0 rgba(255,255,255,0.9)'
    : '0 4px 18px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)';

  return (
    <>
      <ScrollProgressBar />

      {/* ── Desktop pill nav ─────────────────────────────────────────────── */}
      <motion.nav
        className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 items-center gap-1 px-4 py-2 rounded-full"
        style={{
          background:          glassBg,
          backdropFilter:      'blur(22px) saturate(180%)',
          WebkitBackdropFilter:'blur(22px) saturate(180%)',
          border:              '1px solid rgba(255,255,255,0.65)',
          boxShadow:           glassShadow,
          transition:          'background 0.3s ease, box-shadow 0.3s ease',
        }}
        initial={{ opacity: 0, y: -28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold gradient-text shrink-0 px-2 py-1 mr-2">
            <Brush className="w-4 h-4 text-primary" />
            SR Arts
          </Link>
        </motion.div>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Nav links */}
        {navItems.map(item => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname.startsWith(item.href)}
          />
        ))}

        <div className="h-4 w-px bg-border mx-1" />

        {/* Commission CTA */}
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} className="relative">
          {/* Pulse ring */}
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <Link
            href="/commission"
            className="relative text-sm font-bold px-5 py-2 rounded-full bg-primary text-white hover:bg-primary-light transition-colors shadow-sm shadow-primary/30"
          >
            Commission
          </Link>
        </motion.div>

        {/* Auth */}
        <div className="ml-1 flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-foreground/65 hover:text-primary transition-colors px-2 py-1">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 ring-2 ring-primary/30 hover:ring-primary/70 transition-all rounded-full',
                },
              }}
            />
          </SignedIn>
        </div>
      </motion.nav>

      {/* ── Mobile header ────────────────────────────────────────────────── */}
      <motion.header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background:          isOpen || scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.72)',
          backdropFilter:      'blur(22px) saturate(180%)',
          WebkitBackdropFilter:'blur(22px) saturate(180%)',
          borderBottom:        '1px solid rgba(255,255,255,0.52)',
          boxShadow:           '0 2px 18px rgba(0,0,0,0.07)',
          transition:          'background 0.25s ease',
        }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold gradient-text">
          <Brush className="w-4 h-4 text-primary" />
          SR Arts
        </Link>

        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
          </SignedIn>
          <motion.button
            onClick={() => setIsOpen(v => !v)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/65 border border-white/72 shadow-sm hover:bg-white/95 transition-colors"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* ── Mobile dropdown ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              className="md:hidden fixed top-[58px] left-3 right-3 z-50 rounded-2xl overflow-hidden"
              style={{
                background:          'rgba(255,255,255,0.98)',
                backdropFilter:      'blur(28px) saturate(180%)',
                WebkitBackdropFilter:'blur(28px) saturate(180%)',
                border:              '1px solid rgba(255,255,255,0.72)',
                boxShadow:           '0 20px 56px rgba(0,0,0,0.14)',
              }}
              initial={{ opacity: 0, scale: 0.96, y: -10, originX: '50%', originY: '0%' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{   opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <div className="px-4 pt-3 pb-4 space-y-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045, type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <Link
                      href={item.href}
                      className={[
                        'flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium transition-colors',
                        pathname.startsWith(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/75 hover:text-primary hover:bg-accent-subtle',
                      ].join(' ')}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  className="pt-2 pb-1 space-y-2.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                >
                  <Link
                    href="/commission"
                    className="block w-full text-center py-3 px-4 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light transition-colors shadow-sm shadow-primary/25"
                  >
                    Commission Now
                  </Link>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="w-full text-center py-3 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-accent-subtle transition-colors">
                        Sign in
                      </button>
                    </SignInButton>
                  </SignedOut>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
