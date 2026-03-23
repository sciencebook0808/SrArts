/**
 * app/(public)/sign-in/[[...sign-in]]/page.tsx
 *
 * Clerk v7 sign-in page.
 * Lives in (public) route group → inherits public SEO layout.
 *
 * CLERK v7 CHANGES from v6:
 *  - `redirectUrl` prop REMOVED → use `fallbackRedirectUrl` instead
 *  - `afterSignInUrl` REMOVED    → use `fallbackRedirectUrl`
 *  - Page is noindex (sign-in pages should not appear in search results)
 *
 * REDIRECT LOGIC:
 *  If the user arrives via proxy.ts redirect, ?redirect_url= is set in the URL.
 *  Clerk reads this automatically via forceRedirectUrl and routes correctly.
 *  fallbackRedirectUrl is used when no redirect_url param is present.
 */

import type { Metadata } from 'next';
import { SignIn }        from '@clerk/nextjs';

export const metadata: Metadata = {
  title:  'Sign In | SR Arts',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4f0] via-white to-[#f0f4f8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5 mb-6 group" aria-label="SR Arts — back to homepage">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold" style={{ background: 'linear-gradient(135deg, oklch(0.40 0.17 150), oklch(0.55 0.19 155))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SR Arts
            </span>
          </a>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your account to continue</p>
        </div>

        {/* Clerk SignIn — v7 API */}
        <SignIn
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              rootBox:         'w-full',
              card:            'shadow-xl rounded-2xl border border-gray-100 bg-white/98 backdrop-blur-sm',
              headerTitle:     'hidden',
              headerSubtitle:  'hidden',
              socialButtonsBlockButton:
                'border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm',
              formButtonPrimary:
                'rounded-xl font-semibold transition-colors text-sm',
              formFieldInput:
                'border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/25',
              footerActionLink:   'text-primary hover:text-primary/80 font-medium',
              identityPreviewEditButton: 'text-primary hover:text-primary/80',
            },
          }}
        />

        <p className="text-center text-xs text-gray-400 mt-5">
          Admin access requires the{' '}
          <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">admin</code>
          {' '}role set in Clerk.
        </p>
      </div>
    </div>
  );
}
