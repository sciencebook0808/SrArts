import type { Metadata } from 'next';
import Link from 'next/link';
import { FloatingNavbar } from '@/components/floating-navbar';
import { ArrowLeft, Brush, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 — Page Not Found | SR Arts Official',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-accent-subtle via-white to-primary/5 overflow-hidden">
      <FloatingNavbar />

      {/* Decorative ink blots */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, oklch(0.65 0.20 160) 0%, transparent 70%)',
            filter: 'blur(48px)',
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, oklch(0.55 0.18 150) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">

        {/* Painted number */}
        <div className="relative mb-6 select-none">
          {/* Large background 404 */}
          <div
            className="text-[clamp(8rem,25vw,16rem)] font-extrabold leading-none tracking-tighter opacity-[0.06] select-none pointer-events-none"
            aria-hidden="true"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            404
          </div>

          {/* Centered brush icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.70)',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(82,196,26,0.20)',
                  boxShadow: '0 8px 32px rgba(27,67,50,0.10)',
                }}
              >
                <Brush className="w-10 h-10 text-primary" />
              </div>
              {/* Ping animation ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
          Page{' '}
          <span className="gradient-text">Not Found</span>
        </h1>

        {/* Sub-heading */}
        <p className="text-lg text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
          This canvas is blank. The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-light transition-colors shadow-md hover:shadow-lg hover:shadow-primary/25"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-primary text-primary rounded-full font-semibold text-sm hover:bg-accent-subtle transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Gallery
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {[
            { href: '/gallery',    label: 'Gallery' },
            { href: '/blog',       label: 'Blog' },
            { href: '/community',  label: 'Community' },
            { href: '/commission', label: 'Commission' },
            { href: '/about',      label: 'About' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
