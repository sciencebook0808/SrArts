'use client';
/**
 * app/error.tsx — Global error boundary (Next.js 16 App Router)
 *
 * Catches unhandled runtime errors in Server Components and Client Components.
 * Must be a Client Component ('use client') — Next.js requirement.
 *
 * Note: Does NOT catch errors inside error.tsx itself.
 * For layout-level errors, each layout segment can have its own error.tsx.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error tracking service (Sentry, etc.) here
    if (process.env.NODE_ENV === 'development') {
      console.error('[Global Error]', error);
    }
  }, [error]);

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-red-50 via-white to-accent-subtle/40 flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
          Something went wrong
        </h1>

        {/* Message */}
        <p className="text-muted-foreground text-lg mb-2">
          An unexpected error occurred. Please try again.
        </p>

        {/* Error digest (helps support/debugging) */}
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-8" />}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-light transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-border text-foreground/70 rounded-full font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

      </div>
    </main>
  );
}
