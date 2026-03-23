'use client';
/**
 * app/admin/login/page.tsx — Admin sign-in via Clerk (v12)
 *
 * Password auth removed. Admins sign in through Clerk.
 * After sign-in, proxy.ts checks publicMetadata.role and routes to:
 *   → /admin/dashboard  (if admin/superadmin)
 *   → /admin/access-denied (if role not set)
 *
 * HOW TO GRANT ADMIN ACCESS:
 *   Clerk Dashboard → Users → [User] → Public Metadata → { "role": "admin" }
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SignIn } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // If already signed in, go straight to dashboard
  // (middleware will validate role and redirect to access-denied if needed)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/admin/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold gradient-text mb-1">SR Arts Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in with your Clerk account</p>
        </div>

        {/* Clerk SignIn component */}
        <SignIn
          redirectUrl="/admin/dashboard"
          appearance={{
            elements: {
              rootBox:            'w-full',
              card:               'shadow-xl rounded-2xl border border-border bg-white/95 backdrop-blur',
              headerTitle:        'hidden',
              headerSubtitle:     'hidden',
              socialButtonsBlockButton:
                'border border-border rounded-xl hover:bg-accent-subtle transition-colors font-medium text-sm',
              formButtonPrimary:
                'bg-primary hover:bg-primary/90 rounded-xl font-semibold transition-colors',
              formFieldInput:
                'border border-border rounded-xl focus:ring-2 focus:ring-primary/30 text-sm',
              footerActionLink:   'text-primary hover:text-primary/80',
            },
          }}
        />

        <p className="text-center text-xs text-muted-foreground/60 mt-5">
          Only accounts with <code className="font-mono bg-accent-subtle px-1 rounded">admin</code> role in Clerk can access the dashboard.
        </p>
      </div>
    </div>
  );
}
