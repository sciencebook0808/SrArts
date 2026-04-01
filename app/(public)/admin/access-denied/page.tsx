'use client';
/**
 * app/(public)/admin/access-denied/page.tsx
 *
 * Shown when a signed-in Clerk user lacks admin/superadmin role.
 * Lives in (public) group — MUST remain unguarded to prevent redirect loops.
 *
 * Clerk v7 changes:
 *  - <SignedIn>  → <Show when="signed-in">
 *  - <SignedOut> → <Show when="signed-out">
 *  - afterSignOutUrl removed from <UserButton>
 *
 * SEO: noindex — this error page must not be indexed.
 */

import { motion }          from 'motion/react';
import { ShieldX, Home, Mail, ArrowLeft } from 'lucide-react';
import Link                from 'next/link';
import { Show, UserButton, SignInButton } from '@clerk/nextjs';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4f0] via-white to-[#f0f4f8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, rotate: -8 }}
          animate={{ scale: 1,   rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 22 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 border-2 border-red-100 mb-6 shadow-sm"
        >
          <ShieldX className="w-9 h-9 text-red-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="text-3xl font-extrabold text-foreground mb-3"
        >
          Access Denied
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-muted-foreground text-base leading-relaxed mb-2"
        >
          You are not authorised to access the admin area.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="text-sm text-muted-foreground/70 mb-8"
        >
          Admin access requires the{' '}
          <code className="px-1.5 py-0.5 rounded bg-accent-subtle text-foreground/80 font-mono text-xs">admin</code>
          {' '}or{' '}
          <code className="px-1.5 py-0.5 rounded bg-accent-subtle text-foreground/80 font-mono text-xs">superadmin</code>
          {' '}role in your Clerk account.
        </motion.p>

        {/* Clerk user info — Clerk v7: Show replaces SignedIn/SignedOut */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-8"
        >
          <Show when="signed-in">
            <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-border rounded-2xl shadow-sm">
              {/* Clerk v7: afterSignOutUrl prop removed */}
              <UserButton />
              <span className="text-sm text-muted-foreground">Signed in with wrong account?</span>
            </div>
          </Show>
          <Show when="signed-out">
            <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-border rounded-2xl shadow-sm">
              <SignInButton mode="modal">
                <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign in with a different account
                </button>
              </SignInButton>
            </div>
          </Show>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl font-semibold text-sm text-foreground/70 hover:bg-accent-subtle hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.52 }}
          className="mt-8 text-xs text-muted-foreground/60"
        >
          Need access?{' '}
          <a
            href="mailto:admin@sr-arts.com"
            className="inline-flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
          >
            <Mail className="w-3 h-3" />
            Contact the administrator
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
