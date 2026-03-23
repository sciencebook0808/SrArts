# SR Arts Official — v15

Production-grade Next.js 16 artist portfolio with Clerk v7 auth, Prisma 7, TailwindCSS 4.

## Stack

| Layer | Package | Version |
|---|---|---|
| Framework | Next.js | 16.2.1 |
| Auth | @clerk/nextjs | ^7.0.5 |
| Database ORM | @prisma/client | ^7.5.0 |
| Database | CockroachDB Serverless | — |
| Styling | Tailwind CSS | ^4.2.2 |
| Animation | Framer Motion + GSAP | ^12 + ^3.14 |
| Images | Cloudinary (next-cloudinary) | ^6.17.5 |
| Rich Text | TipTap | ^3.20.3 |
| 3D | Three.js + R3F | ^0.182 + ^9.5 |

## App Structure

```
proxy.ts                          ← Next.js 16 interceptor (replaces middleware.ts)
app/
  layout.tsx                      ← Root: ClerkProvider, fonts, analytics
  (public)/
    layout.tsx                    ← SEO metadata, robots: index/follow
    page.tsx                      ← Homepage
    about/, gallery/, blog/       ← Public pages
    commission/, community/       ← Public pages
    terms/, privacy/              ← Legal pages
    [username]/                   ← User profiles
    sign-in/[[...sign-in]]/       ← Clerk sign-in (Clerk v7: fallbackRedirectUrl)
    sign-up/[[...sign-up]]/       ← Clerk sign-up
    admin/access-denied/          ← Auth error page (MUST be public)
  (dashboard)/
    layout.tsx                    ← Auth guard: role check, robots: noindex
    admin/dashboard/              ← Admin dashboard
    admin/artworks/               ← Artwork CRUD
    admin/blog/                   ← Blog CRUD
  api/                            ← All API routes (unchanged paths)
```

## Auth Flow

1. User visits `/admin/*`
2. `proxy.ts` checks Clerk session + `publicMetadata.role`
3. Not signed in → `/sign-in?redirect_url=/admin/dashboard`
4. Signed in, no role → `/admin/access-denied`
5. Signed in, has role → `(dashboard)/layout.tsx` double-checks → renders

## Grant Admin Access

```
Clerk Dashboard → Users → [user] → Public Metadata
{ "role": "admin" }
```

## Setup

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, Clerk keys, Cloudinary keys

npm install
npm run db:migrate
npm run dev
```

## Clerk v7 Breaking Changes Applied

- `<SignedIn>` → `<Show when="signed-in">`
- `<SignedOut>` → `<Show when="signed-out">`
- `afterSignOutUrl` prop removed from `<UserButton>` → use `NEXT_PUBLIC_CLERK_SIGN_OUT_URL` env
- `redirectUrl` on `<SignIn>/<SignUp>` → `fallbackRedirectUrl`

## lucide-react 0.5+ Breaking Changes Applied

Brand icons removed (`Instagram`, `Twitter`, `Facebook`, `Github`).
Replaced with inline SVG components throughout the codebase.
