'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLenis } from '@/lib/lenis-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Palette, Users } from 'lucide-react';
import {
  SignInButton, SignUpButton, UserButton,
  SignedIn, SignedOut,
} from '@clerk/nextjs';

const navItems = [
  { label: 'Gallery',   href: '/gallery' },
  { label: 'Blog',      href: '/blog' },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'About',     href: '/about' },
];

export function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen]     = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const handler = ({ scroll }: { scroll: number }) => setScrolled(scroll > 40);
    lenis.on('scroll', handler);
    return () => lenis.off('scroll', handler);
  }, [lenis]);

  const glass = {
    background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.70)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.65)',
    boxShadow: scrolled
      ? '0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)'
      : '0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
  };

  return (
    <>
      {/* ── Desktop pill ─────────────────────────────────────────────────── */}
      <motion.nav
        className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 items-center gap-6 px-7 py-3 rounded-full"
        style={glass}
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/" className="flex items-center gap-2 text-xl font-bold gradient-text shrink-0">
          <Palette className="w-5 h-5 text-primary" />
          SR Arts
        </Link>

        <div className="h-5 w-px bg-border" />

        <div className="flex gap-4 items-center">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {item.icon && <item.icon className="w-3.5 h-3.5" />}
              {item.label}
            </Link>
          ))}
        </div>

        <div className="h-5 w-px bg-border" />

        <div className="flex items-center gap-3">
          <Link
            href="/commission"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-light transition-colors shadow-sm"
          >
            Commission
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 ring-2 ring-primary/30 hover:ring-primary/60 transition-all',
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
          background: isOpen || scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.70)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.50)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href="/" className="flex items-center gap-2 text-lg font-bold gradient-text">
          <Palette className="w-5 h-5 text-primary" />
          SR Arts
        </Link>

        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: 'w-7 h-7' } }}
            />
          </SignedIn>
          <button
            onClick={() => setIsOpen(v => !v)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/60 border border-white/70 shadow-sm hover:bg-white/90 transition-colors"
            aria-label="Toggle menu"
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
          </button>
        </div>
      </motion.header>

      {/* ── Mobile dropdown ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed top-[56px] left-3 right-3 z-40 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.70)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
            }}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium text-foreground/80 hover:text-primary hover:bg-accent-subtle transition-all"
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-2 pb-1 space-y-2">
                <Link
                  href="/commission"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-3 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors"
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
