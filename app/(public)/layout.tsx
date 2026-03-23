/**
 * app/(public)/layout.tsx
 *
 * Passthrough layout for the (public) route group.
 * All public routes inherit the root app/layout.tsx (Clerk, Lenis, etc.)
 * This file exists to define the route group boundary — no extra logic needed.
 * Each public page manages its own FloatingNavbar as required.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
