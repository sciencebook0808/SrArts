/**
 * app/loading.tsx — Global loading UI (Next.js 16 Suspense boundary)
 *
 * Renders automatically during:
 *  - Server Component data fetching
 *  - Route segment transitions
 *
 * Keeps it minimal — full-screen spinner matching the site theme.
 */

import { Brush } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-accent-subtle/40 via-white to-white">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark */}
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Brush className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping" />
        </div>
        <p className="text-sm text-muted-foreground font-medium tracking-wide">
          Loading…
        </p>
      </div>
    </div>
  );
}
