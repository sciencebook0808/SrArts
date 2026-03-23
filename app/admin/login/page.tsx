'use client';
/**
 * app/admin/login/page.tsx
 *
 * Lives in app/admin/ (NOT inside app/(admin)/) so the admin guard layout
 * never wraps this page. It is always publicly accessible.
 *
 * After successful sign-in Clerk fires forceRedirectUrl="/admin/dashboard".
 * Middleware and (admin)/layout.tsx will gate that route based on role.
 *
 * NO useEffect redirects — those caused triple-redirect race conditions.
 * The page simply shows the Clerk <SignIn> widget and nothing else.
 */

import { SignIn }    from '@clerk/nextjs';
import { useAuth }  from '@clerk/nextjs';
import { Loader2 }  from 'lucide-react';
import Link         from 'next/link';

export default function AdminLoginPage() {
  const { isLoaded } = useAuth();

  // Show spinner only while Clerk SDK initialises (< 300 ms typically)
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-subtle via-white to-primary/5">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-subtle via-white to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <svg
              width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold gradient-text mb-1">SR Arts Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in with your Clerk account</p>
        </div>

        {/*
          forceRedirectUrl: after sign-in always land on /admin/dashboard.
          Middleware will allow it only if the account has the admin role.
          If role is missing, middleware redirects to /admin/access-denied.
        */}
        <SignIn
          forceRedirectUrl="/admin/dashboard"
          appearance={{
            elements: {
              rootBox:                  'w-full',
              card:                     'shadow-xl rounded-2xl border border-border bg-white/95 backdrop-blur',
              headerTitle:              'hidden',
              headerSubtitle:           'hidden',
              socialButtonsBlockButton: 'border border-border rounded-xl hover:bg-accent-subtle transition-colors font-medium text-sm',
              formButtonPrimary:        'bg-primary hover:bg-primary/90 rounded-xl font-semibold transition-colors',
              formFieldInput:           'border border-border rounded-xl focus:ring-2 focus:ring-primary/30 text-sm',
              footerActionLink:         'text-primary hover:text-primary/80',
            },
          }}
        />

        <p className="text-center text-xs text-muted-foreground/60 mt-5">
          Requires{' '}
          <code className="font-mono bg-accent-subtle px-1 rounded">admin</code>
          {' '}or{' '}
          <code className="font-mono bg-accent-subtle px-1 rounded">superadmin</code>
          {' '}role in Clerk.
        </p>

        <p className="text-center mt-3">
          <Link href="/" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
