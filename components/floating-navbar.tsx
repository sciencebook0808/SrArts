'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLenis } from '@/lib/lenis-provider';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function FloatingNavbar() {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    let lastScrollY = 0;

    const handleScroll = (instance: { scroll: number }) => {
      const currentScrollY = instance.scroll;
      setIsScrolling(currentScrollY > lastScrollY && currentScrollY > 100);
      lastScrollY = currentScrollY;
    };

    lenis.on('scroll', handleScroll);

    return () => {
      lenis.off('scroll', handleScroll);
    };
  }, [lenis]);

  const navItems = [
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className="hidden md:flex fixed top-8 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-8 py-3 gap-8 items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/" className="text-xl font-bold gradient-text">
          SR Arts
        </Link>

        <div className="h-6 w-px bg-border" />

        <div className="flex gap-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        <Link
          href="#commission"
          className="btn-base bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary-light"
        >
          Commission
        </Link>
      </motion.nav>

      {/* Mobile Bottom Navbar */}
      <motion.nav
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-4 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 transition-colors"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <motion.div
          className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-6 py-4 w-[90%] max-w-xs"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="#commission"
              className="btn-base bg-primary text-white px-4 py-2 text-sm rounded-lg w-full justify-center mt-2"
              onClick={() => setIsOpen(false)}
            >
              Commission
            </Link>
          </div>
        </motion.div>
      )}
    </>
  );
}
