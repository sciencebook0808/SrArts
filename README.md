# SR Arts Official

A premium artist portfolio platform built with Next.js 16, featuring an animated gallery, community feed, commission system, and a full admin dashboard — all backed by CockroachDB via Prisma 7.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Cloudinary Setup](#cloudinary-setup)
- [Clerk Auth Setup](#clerk-auth-setup)
- [Admin Access](#admin-access)
- [Available Scripts](#available-scripts)
- [Deployment (Vercel)](#deployment-vercel)
- [Feature Overview](#feature-overview)
- [Animation Architecture](#animation-architecture)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Language | TypeScript (strict) | 5.7.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS v4 | 4.2.2 |
| Database | CockroachDB (PostgreSQL protocol) | — |
| ORM | Prisma | 7.5.0 |
| DB Adapter | @prisma/adapter-pg | 7.5.0 |
| Auth | Clerk | 6.23.0 |
| Image CDN | Cloudinary (next-cloudinary) | 6.17.5 |
| 3D / WebGL | Three.js + React Three Fiber | 0.182.0 / 9.5.0 |
| Animations | GSAP + Framer Motion + Lenis | 3.14.2 / 12.36.0 / 1.3.19 |
| Rich Text | TipTap | 3.20.3 |
| Toasts | Sonner | 2.0.7 |
| Icons | Lucide React | 0.477.0 |
| Analytics | Vercel Analytics | 1.6.1 |

---

## Project Structure

```
sr-arts/
├── app/
│   ├── about/                  # Artist About page (painted canvas portrait)
│   ├── admin/
│   │   ├── dashboard/          # Full admin CRUD dashboard
│   │   └── login/              # Admin login
│   ├── api/
│   │   ├── admin/              # Admin-only API routes (session-protected)
│   │   ├── artworks/           # Artwork CRUD
│   │   ├── blog/               # Blog post CRUD
│   │   ├── categories/         # Category CRUD
│   │   ├── comments/           # Comments (polymorphic)
│   │   ├── commissions/        # Commission requests
│   │   ├── community/          # Community posts, likes, reposts, shares
│   │   ├── indexing/           # IndexNow SEO pinging
│   │   ├── likes/              # Artwork likes
│   │   ├── pages/              # Static pages (terms, privacy)
│   │   ├── profile/            # Artist profile CRUD
│   │   └── stats/              # Public stats endpoint
│   ├── blog/                   # Blog listing + individual post pages
│   ├── commission/             # Commission request form
│   ├── community/
│   │   └── [slug]/             # Individual community post page
│   ├── gallery/
│   │   └── [slug]/             # Individual artwork page
│   ├── privacy/                # Privacy Policy (DB-managed)
│   ├── terms/                  # Terms & Conditions (DB-managed)
│   ├── [username]/             # Public user profile page
│   │   └── community/[slug]/   # User's post under their profile URL
│   ├── globals.css             # Design system, animations, glassmorphism
│   ├── layout.tsx              # Root layout with Clerk, Lenis, CursorTrail
│   ├── page.tsx                # Homepage
│   ├── robots.ts               # robots.txt
│   └── sitemap.ts              # XML sitemap
│
├── components/
│   ├── 3d/
│   │   └── floating-particles.tsx   # Three.js instanced particle background
│   ├── about/
│   │   ├── about-client-section.tsx # Client boundary for About page
│   │   └── painted-canvas.tsx       # Artistic canvas portrait (admin + about)
│   ├── admin/
│   │   ├── image-uploader.tsx       # Cloudinary upload widget
│   │   └── tiptap-editor.tsx        # Rich text editor
│   ├── community/
│   │   ├── create-post.tsx          # New post form
│   │   ├── feed.tsx                 # Infinite scroll community feed
│   │   ├── page-header.tsx          # Animated community page title
│   │   ├── post-card.tsx            # Post card with like/share/repost
│   │   ├── post-detail.tsx          # Full post page view
│   │   └── user-painted-canvas.tsx  # Per-user artistic canvas card
│   ├── ui/                          # shadcn/ui components
│   │   ├── animated-button.tsx      # Spring physics button
│   │   ├── animated-card.tsx        # 3D tilt hover card
│   │   └── ...                      # All other UI primitives
│   ├── artwork-like-button.tsx      # Artwork like toggle
│   ├── comments-section.tsx         # Polymorphic comments
│   ├── cursor-trail.tsx             # Custom spring cursor (desktop)
│   ├── floating-navbar.tsx          # Glassmorphism pill navbar
│   ├── gallery-grid.tsx             # Filtered gallery with brush reveal
│   ├── gallery-hero.tsx             # Gallery page GSAP parallax header
│   ├── hero-section.tsx             # Canvas brush intro + Three.js hero
│   ├── page-transition.tsx          # Route change fade animation
│   ├── scroll-reveal.tsx            # GSAP scroll reveal wrapper
│   ├── sections-animator.tsx        # Single client boundary for page sections
│   └── user-profile-client.tsx      # Instagram-style user profile
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/
│   ├── admin-auth.ts           # Admin session (cookie-based)
│   ├── db-server.ts            # All Prisma server functions
│   ├── db.ts                   # Prisma singleton + PrismaPg adapter
│   ├── gsap-utils.ts           # ScrollTrigger utilities
│   ├── lenis-provider.tsx      # Smooth scroll + GSAP ticker sync
│   ├── seo-utils.ts            # OpenGraph / structured data helpers
│   └── utils.ts                # cn() + misc helpers
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
│
├── public/                     # Static assets + favicons
├── .env.local                  # Your local secrets (never commit this)
├── .env.example                # Template — copy to .env.local
├── next.config.mjs             # Next.js config (image domains, server packages)
├── prisma.config.ts            # Prisma 7 CLI config (DATABASE_URL lives here)
├── tsconfig.json               # TypeScript strict config
└── package.json
```

---

## Prerequisites

Before starting, make sure you have:

- **Node.js** 20.x or later — `node --version`
- **npm** 10.x or later — `npm --version`
- A **CockroachDB** account (free tier works) — [cockroachlabs.com](https://cockroachlabs.com)
- A **Clerk** account — [clerk.com](https://clerk.com)
- A **Cloudinary** account — [cloudinary.com](https://cloudinary.com)
- A **Vercel** account (for deployment) — [vercel.com](https://vercel.com)

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourusername/sr-arts.git
cd sr-arts
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Then edit .env.local with your actual credentials (see below)
```

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The admin panel is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value. All variables marked **Required** must be set for the app to function.

### Database

```env
# Required — CockroachDB connection string
# Format: postgresql://[user]:[password]@[host]:26257/[database]?sslmode=verify-full
DATABASE_URL="postgresql://sr_arts_user:your-password@your-cluster.cockroachdb.com:26257/defaultdb?sslmode=verify-full"
```

**How to get this:**
1. Log in to [CockroachDB Cloud](https://cockroachlabs.com)
2. Create a new Serverless cluster (free tier)
3. Click **Connect** → choose **General connection string**
4. Copy the `postgresql://` connection string
5. Replace `<ENTER-SQL-USER-PASSWORD>` with your actual password

> The `sslmode=verify-full` parameter is required for CockroachDB Cloud. Omitting it will cause connection failures.

---

### Admin Authentication

The admin panel (`/admin/dashboard`) uses a simple session-cookie system, separate from Clerk. You set a password that only you know.

```env
# Required — used to log into /admin/login
ADMIN_PASSWORD="choose-a-strong-password-here"

# Optional — informational only (not used for auth logic currently)
ADMIN_EMAIL="admin@yourdomain.com"
```

> The password is hashed with SHA-256 before comparison. It is never stored in the database.

---

### Clerk Authentication

Clerk handles all public user authentication (community posts, likes, profile pages).

```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# Required — URL redirects after sign in / sign up
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

**How to get these:**
1. Log in to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application (choose "Email + Social")
3. Go to **API Keys** in the sidebar
4. Copy **Publishable Key** and **Secret Key**

> Use `pk_test_` and `sk_test_` keys during development. Switch to `pk_live_` and `sk_live_` for production.

---

### Cloudinary (Image Uploads)

All artwork images, profile photos, and banner images are stored on Cloudinary.

```env
# Required
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# Required — the upload preset name (must be unsigned)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="sr_arts_uploads"
```

**How to set up:**
1. Log in to [cloudinary.com/console](https://cloudinary.com/console)
2. Your **Cloud Name** is shown at the top of the dashboard
3. Go to **Settings → Upload → Upload presets**
4. Click **Add upload preset**
   - Set **Signing Mode** to `Unsigned`
   - Set **Folder** to `sr_arts`
   - Set the preset name to `sr_arts_uploads` (or match your env var)
5. Save the preset

> The upload preset must be **unsigned** because uploads happen from the browser without a server signature step.

---

### Site URL

```env
# Required — used for sitemap, OpenGraph canonical URLs, share links
NEXT_PUBLIC_SITE_URL="https://sr-arts.com"

# Use http://localhost:3000 during local development
```

---

### Analytics (all optional)

All analytics integrations are disabled by default. Set the relevant IDs to enable them.

```env
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Google Ads conversion tracking
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-1234567890"

# Meta (Facebook) Pixel
NEXT_PUBLIC_META_PIXEL_ID="1234567890123456"

# Google Search Console ownership verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="abcdef123456"

# Bing Webmaster Tools ownership verification
NEXT_PUBLIC_BING_SITE_VERIFICATION="abcdef123456"
```

---

### Google AdSense (optional)

```env
# Set to "true" to enable AdSense script injection
NEXT_PUBLIC_ADSENSE_ENABLED="false"

# Your AdSense publisher ID (e.g. ca-pub-1234567890123456)
NEXT_PUBLIC_ADSENSE_CLIENT=""
```

> AdSense ads only appear on pages where you add an `<AdSlot>` component. Enabling this variable alone does not show ads anywhere.

---

### IndexNow — SEO Search Indexing (optional)

```env
# From https://www.indexnow.org — submit new content to search engines instantly
INDEXNOW_KEY=""
```

**How to get this:**
1. Go to [indexnow.org](https://www.indexnow.org/documentation)
2. Generate a key
3. Place the key as a text file at `public/[your-key].txt`
4. Set `INDEXNOW_KEY` to the same value

---

### Complete `.env.local` Template

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@cluster.cockroachdb.com:26257/defaultdb?sslmode=verify-full"

# ── Admin ─────────────────────────────────────────────────────────────────────
ADMIN_PASSWORD="your-secure-admin-password"
ADMIN_EMAIL="admin@yourdomain.com"

# ── Clerk ─────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# ── Cloudinary ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="sr_arts_uploads"

# ── Site ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="https://sr-arts.com"

# ── Analytics (optional) ──────────────────────────────────────────────────────
NEXT_PUBLIC_GA_MEASUREMENT_ID=""
NEXT_PUBLIC_GOOGLE_ADS_ID=""
NEXT_PUBLIC_META_PIXEL_ID=""
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
NEXT_PUBLIC_BING_SITE_VERIFICATION=""

# ── AdSense (optional) ────────────────────────────────────────────────────────
NEXT_PUBLIC_ADSENSE_ENABLED="false"
NEXT_PUBLIC_ADSENSE_CLIENT=""

# ── IndexNow (optional) ───────────────────────────────────────────────────────
INDEXNOW_KEY=""
```

---

## Database Setup

### First-time setup

```bash
# Push schema to your database (creates all tables)
npm run db:push

# Alternative: create a tracked migration file first
npm run db:migrate:dev --name init
```

### After schema changes (adding new fields)

Whenever `prisma/schema.prisma` is updated, sync the database:

```bash
# Development — push directly (no migration file)
npm run db:push

# Production — create a migration and apply it
npm run db:migrate:dev --name describe_your_change
npm run db:migrate        # applies pending migrations in CI/CD
```

### Inspect your database visually

```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

### Connection format details

CockroachDB uses the PostgreSQL wire protocol. Your connection string must:

- Start with `postgresql://` (not `cockroachdb://`)
- Use port `26257`
- Include `?sslmode=verify-full` for Cloud clusters
- Use `defaultdb` as the database name unless you created a custom one

```
postgresql://sr_arts_user:MyP@ssw0rd@free-tier.cockroachdb.com:26257/defaultdb?sslmode=verify-full
              ^^^^^^^^^^^^  ^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^  ^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^
              username      password   hostname                         port   database     ssl mode
```

---

## Cloudinary Setup

### Create an upload preset

1. Go to **Cloudinary Console → Settings → Upload**
2. Click **Add upload preset**
3. Configure:

| Setting | Value |
|---------|-------|
| Preset name | `sr_arts_uploads` |
| Signing mode | `Unsigned` |
| Folder | `sr_arts` |
| Allowed formats | `jpg, jpeg, png, webp, gif` |
| Max file size | `10 MB` |
| Transformation | Add `q_auto,f_auto` for auto optimization |

4. Save and copy the preset name to `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### Recommended transformations

In your upload preset, add these default transformations for automatic optimization:

```
quality: auto
fetch_format: auto
```

This automatically serves WebP to modern browsers and optimizes quality without manual intervention.

---

## Clerk Auth Setup

### Create your application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → **Create application**
2. Choose your sign-in options (recommend: Email + Google)
3. Go to **API Keys** and copy both keys

### Configure allowed redirect URLs (production)

In Clerk Dashboard → **Domains**, add your production domain:

```
https://sr-arts.com
```

### Username support (required for user profiles)

Community user profiles are accessed at `/{username}`. Clerk must have usernames enabled:

1. Go to **User & Authentication → Email, Phone, Username**
2. Enable **Username**
3. Set it as required or optional based on your preference

Without usernames enabled, user profile URLs will fall back to the Clerk user ID.

### Social login (optional but recommended)

In **Social Connections**, enable Google, GitHub, or others. This improves sign-up conversion for the community.

---

## Admin Access

The admin dashboard is at `/admin/login` and is completely separate from Clerk auth.

### Logging in

1. Navigate to `https://your-domain.com/admin/login`
2. Enter the password you set in `ADMIN_PASSWORD`
3. You are redirected to `/admin/dashboard`

### Session duration

Admin sessions expire after **24 hours**. Sessions are stored as `HttpOnly` cookies and are scoped to the `/admin` path.

### What you can manage

| Section | Capabilities |
|---------|-------------|
| Overview | Stats, quick links |
| Artworks | Upload, edit, publish/draft, feature, delete |
| Categories | Create, delete artwork categories |
| Blog Posts | Write (TipTap editor), publish, feature, delete |
| Commissions | View requests, update status (pending/confirmed/completed/cancelled) |
| Comments | View and delete comments across artworks, blog, and community |
| Profile | Edit artist profile: name, bio, skills, social links, **experience timeline**, **achievements**, profile photo, banner — with **live canvas preview** |
| Legal Pages | Edit Terms & Conditions and Privacy Policy with rich text editor |

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server at http://localhost:3000

# Production
npm run build            # Run prisma generate + next build
npm run start            # Start production server

# Database
npm run db:generate      # Regenerate Prisma Client after schema changes
npm run db:push          # Sync schema to DB (no migration file — use in dev)
npm run db:migrate       # Apply pending migration files (use in CI/production)
npm run db:migrate:dev   # Create + apply a new migration in development
npm run db:studio        # Open Prisma Studio at http://localhost:5555

# Code quality
npm run lint             # Run ESLint
```

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)

### 3. Add environment variables

In Vercel Project Settings → **Environment Variables**, add every variable from your `.env.local`. Mark sensitive keys (database password, Clerk secret, admin password) as **Production** only.

The minimum required variables for production:

```
DATABASE_URL
ADMIN_PASSWORD
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
NEXT_PUBLIC_SITE_URL
```

### 4. Deploy

Click **Deploy**. Vercel will run `npm run build` which includes `prisma generate` automatically via the `postinstall` script.

### 5. Run database migration in production

After your first deployment, run the schema push via Vercel CLI or from your local machine pointing to the production database:

```bash
# From local machine with production DATABASE_URL set temporarily
DATABASE_URL="postgresql://..." npx prisma db push
```

Or use the Vercel CLI:

```bash
vercel env pull .env.production.local
npx dotenv -e .env.production.local -- npx prisma db push
```

### Build configuration

The project uses these Vercel settings automatically via `next.config.mjs`:

- `serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg']` — prevents Prisma from being bundled into edge/client bundles
- Image optimization domains for Cloudinary and Clerk are pre-configured

---

## Feature Overview

### Homepage

- Canvas brush-painting intro animation (runs once per session via `sessionStorage`)
- GSAP text reveal for headline
- Three.js interactive particle background (mouse repulsion, scroll tilt)
- Typewriter motivational quotes loop
- Featured artworks grid from database
- Live stats from database (no hardcoded numbers)
- Scroll-triggered section reveals via GSAP ScrollTrigger + `data-reveal` attributes
- Commission CTA and blog preview

### Gallery

- All published artworks with category filter and search
- First-visit brush-wipe reveal per card (tracked via `localStorage`)
- GSAP parallax page header with ink-stroke SVG underline
- Framer Motion card hover: lift + glow + image zoom

### Community

- Real-time post feed with infinite scroll
- Create posts (text + image upload via Cloudinary)
- Like, repost (with LinkedIn-style note), share (Web Share API → clipboard fallback)
- Share counter persisted in DB
- Comment system (expandable per post)
- Individual post pages at `/community/[slug]` (SEO-optimised with OpenGraph)
- Slug auto-generated from post content on creation

### User Profiles

- Public profile at `/{username}` showing all their posts
- Artistic painted canvas portrait with `@username` watermark (color-coded per user)
- Post detail URL: `/{username}/community/[slug]`
- Grid view (image posts) and list view (all posts)
- Own profile: Edit Profile button linking to Clerk UserProfile
- Stats: post count, likes received, join date

### About Page

- Artistic **painted canvas portrait** of the artist with `@sr.arts.official` watermark
- Canvas is rendered via Canvas 2D API with brush strokes, linen texture, and varnish gloss
- Experience timeline (add/edit/delete in admin)
- Achievements & Recognition grid (add/edit/delete in admin)
- Skills tags, social links, stats, commission CTA
- JSON-LD structured data for SEO (Person schema)

### Admin Dashboard

- **Profile tab**: Full profile editor with live canvas preview that updates as you type, experience timeline builder, achievements builder
- **Artworks**: Upload with Cloudinary, publish/draft toggle, featured toggle
- **Blog**: TipTap rich text editor, cover images, category tags
- **Commissions**: View requests, update workflow status
- **Comments**: Moderate across all content types
- **Legal**: Rich text editor for Terms & Privacy pages (DB-managed)

---

## Animation Architecture

Animations are split by tool based on use-case for optimal performance:

| Effect | Tool | Reason |
|--------|------|--------|
| Canvas brush intro | Canvas 2D API + GSAP timeline | Pixel-level control, GSAP handles timing |
| Scroll section reveals | GSAP ScrollTrigger | Industry standard, works with Lenis |
| Component springs | Framer Motion | React-native, layout animations, `AnimatePresence` |
| 3D particle background | Three.js (R3F) | GPU-accelerated, lazy loaded |
| Smooth scroll | Lenis | Drives GSAP ticker — single `rAF` loop |
| Custom cursor lag | Framer Motion `useSpring` | Physics spring, perfect for cursor ring |

### Adding scroll animations to any element

Wrap a section in `<SectionsAnimator>` and add `data-reveal` attributes:

```tsx
<SectionsAnimator>
  <div data-reveal="fadeUp">Fades up on scroll</div>
  <div data-reveal="fadeBlur">Blurs in on scroll</div>
  <div data-reveal="slideLeft">Slides from left</div>
  <div data-stagger="0.08" data-stagger-preset="fadeUp">
    <div>Child 1 (staggers in)</div>
    <div>Child 2</div>
    <div>Child 3</div>
  </div>
</SectionsAnimator>
```

Available presets: `fadeUp` · `fadeIn` · `fadeBlur` · `slideLeft` · `slideRight` · `scale` · `stagger`

### Resetting animations for development

```js
// Reset hero brush intro (runs per session)
sessionStorage.removeItem('sr-intro-done')

// Reset gallery first-visit brush reveal
localStorage.removeItem('sr-gallery-painted')
```

---

## Troubleshooting

### `DATABASE_URL environment variable is not set`

You haven't created `.env.local` yet, or it's missing the `DATABASE_URL` key. Run:

```bash
cp .env.example .env.local
# Then add your database URL
```

### `Can't reach database server`

- Verify your CockroachDB cluster is running (not paused — free tier pauses after inactivity)
- Check the connection string format includes `?sslmode=verify-full`
- Make sure the IP allowlist in CockroachDB includes your current IP (or use `0.0.0.0/0` for development)

### Clerk auth not working / redirecting incorrectly

- Confirm `NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"` matches actual Clerk routes
- In Clerk Dashboard → **Domains**, ensure your domain is added and verified
- For local dev, Clerk works with `localhost:3000` automatically

### Images not loading (from Cloudinary or Clerk)

Ensure `next.config.mjs` includes the relevant hostname in `remotePatterns`. The current config already includes:
- `res.cloudinary.com`
- `img.clerk.com`
- `images.clerk.dev`
- `www.gravatar.com`

### Admin login not working

- Confirm `ADMIN_PASSWORD` is set in `.env.local` (non-empty)
- Passwords are case-sensitive
- Clear browser cookies for `localhost` and try again

### `prisma generate` errors on build

Vercel runs `prisma generate` via the `postinstall` script. If it fails:
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Confirm `@prisma/client` and `prisma` versions match in `package.json`

### Three.js not rendering on mobile

The particle canvas automatically reduces to 350 particles and `dpr: 1` on mobile screens. If performance is still poor, the canvas is fully lazy-loaded — verify your browser supports WebGL with `WEBGL_debug_renderer_info`.

### TypeScript errors after pulling updates

```bash
npm run db:generate    # Regenerate Prisma types after schema changes
npm run build          # Full type check
```

---

## License

Private project — all rights reserved. Developed by FBADevDev (Ishant Solutions) for SR Arts Official.
