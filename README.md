# SR Arts - Premium Artist Portfolio

A world-class, ultra-premium, animation-rich artist portfolio website built with Next.js 16, React 19, Tailwind CSS 4, and cutting-edge animation technologies.

## Features

### Visual Excellence
- **Smooth Scrolling**: Lenis-powered ultra-smooth scroll across entire site
- **Advanced Animations**: GSAP + ScrollTrigger for scroll-based reveals and parallax
- **3D Hero Section**: React Three Fiber floating particles with soft green glow
- **Glassmorphism UI**: Premium frosted glass aesthetic with soft shadows
- **Design System**: White base + light green accent, premium minimal style

### Gallery System
- Masonry grid layout with animated transitions
- Category filtering (Anime, Realistic, Modern, Custom)
- Staggered loading animations
- Featured artwork carousel
- Single artwork detail pages with comments
- Like/share functionality

### Blog System
- Rich text editor (TipTap) for content creation
- Blog listing with search and category filters
- Featured post highlight
- Single blog post reading layout
- Related articles section

### Commission System
- Comprehensive commission request form
- Budget range selection
- Timeline options
- Style preferences
- File attachment support
- Form validation with Zod

### Admin Dashboard
- Secure password-protected access
- Full CRUD operations for:
  - Artworks management
  - Category management
  - Blog posts
  - Orders tracking
  - Support tickets
- Dashboard overview with stats
- Recent activity feed

### Backend Integration
- Appwrite Cloud database
- Cloudinary image CDN
- Secure admin authentication
- Database collections for all entities
- Server-side API endpoints

### SEO & Performance
- Dynamic metadata generation
- XML sitemap
- Robots.txt configuration
- Structured data (Schema.org)
- Google Analytics integration
- Ad slot system (ready for Google AdSense)

## Tech Stack

### Frontend
- **Next.js 16.2.1** - App Router, React Compiler enabled
- **React 19.2.4** - Latest with canary features
- **TypeScript 5.7.3**
- **Tailwind CSS 4.2.2** - Latest design system
- **Motion 12.31.0** - Framer Motion for UI animations
- **GSAP 3.14.2** - Advanced animations & ScrollTrigger
- **Lenis 1.3.19** - Smooth scroll engine
- **React Three Fiber 9.5.0** - 3D graphics with Three.js 0.182.0

### Forms & Validation
- **React Hook Form 7.71.2**
- **Zod 3.24.1** - Type-safe validation

### UI Components
- **Radix UI** - Accessible primitives
- **shadcn/ui** - Pre-built components
- **Lucide React 0.577.0** - 456+ icons

### Backend Services
- **Appwrite 22.0.0** - Backend as a Service
- **next-cloudinary 6.17.5** - Image CDN integration

### Rich Text Editing
- **TipTap 3.20.3** - Editor core + extensions

### Utilities
- **Embla Carousel 8.6.0** - Carousel component
- **Vercel Analytics** - Performance monitoring

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Admin
ADMIN_PASSWORD=your_secure_password
NEXTAUTH_SECRET=your_nextauth_secret

# Optional: Google Ads
NEXT_PUBLIC_GOOGLE_AD_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
```

### 2. Appwrite Setup

1. Create a new project on [Appwrite Cloud](https://cloud.appwrite.io)
2. Create the following collections in your database:

**Database: sr_arts_db**

- **categories** - Art categories (Anime, Realistic, Modern, Custom)
- **artworks** - Portfolio pieces with images
- **blog_posts** - Blog articles
- **orders** - Commission orders
- **support** - Support tickets
- **profile** - Artist profile/bio

3. Enable file uploads in Appwrite Storage:
   - Bucket: `artworks`
   - Bucket: `blog`
   - Bucket: `profile`

### 3. Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Create an upload preset for your application

### 4. Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## File Structure

```
app/
├── layout.tsx                 # Root layout with Lenis provider
├── globals.css               # Design system tokens & animations
├── page.tsx                  # Homepage with hero & featured works
├── gallery/
│   ├── page.tsx             # Gallery listing with filters
│   └── [id]/page.tsx        # Artwork detail page
├── blog/
│   ├── page.tsx             # Blog listing
│   └── [id]/page.tsx        # Blog post reading layout
├── commission/
│   └── page.tsx             # Commission request form
├── admin/
│   ├── login/page.tsx       # Admin login
│   ├── dashboard/page.tsx   # Main dashboard
│   └── api/
│       ├── login/route.ts
│       └── logout/route.ts
├── api/
│   └── admin/...            # Admin API endpoints
├── sitemap.ts               # Dynamic XML sitemap
└── robots.ts                # Robots.txt configuration

components/
├── floating-navbar.tsx      # Sticky navbar with hide/show
├── hero-section.tsx         # Hero with CTA buttons
├── 3d/
│   └── floating-particles.tsx  # 3D particle background
├── ad-slot.tsx              # Reusable ad component
└── ui/                      # shadcn/ui components

lib/
├── appwrite.ts              # Appwrite client configuration
├── types.ts                 # TypeScript interfaces
├── lenis-provider.tsx       # Lenis smooth scroll provider
├── gsap-utils.ts            # GSAP animation helpers
├── seo-utils.ts             # SEO metadata generator
├── admin-auth.ts            # Admin authentication
└── utils.ts                 # Utility functions
```

## Key Features Implementation

### Smooth Scrolling (Lenis + GSAP)
- Lenis provider wraps entire app for smooth scrolling
- GSAP ScrollTrigger synced with Lenis scroll events via RAF
- All scroll animations use GSAP with ScrollTrigger
- Mobile-friendly scroll detection for navbar hide/show

### 3D Hero Background
- Lazy-loaded React Three Fiber canvas
- Floating particles with auto-rotating orbit
- Green glow effect matching brand colors
- Performance optimized with dynamic import

### Gallery System
- Responsive masonry grid (1/2/3 columns)
- Category filters with animated transitions
- Staggered card animations on load
- Smooth hover effects with elevation changes
- Search functionality with real-time filtering

### Admin Dashboard
- Password-protected access with secure sessions
- Tab-based interface for different sections
- CRUD operations for all content types
- Recent activity tracking
- Responsive design with mobile support

### Commission Form
- Full validation with Zod schemas
- Support for timeline, budget, and style selection
- File attachments for reference materials
- Success/error messages
- FAQ section below form

## Performance Optimizations

- React Compiler enabled for automatic memoization
- Turbopack as default bundler
- Dynamic imports for 3D components
- Cloudinary for optimized image delivery
- CSS containment for animation performance
- GPU acceleration for transforms/opacity

## SEO Features

- Dynamic metadata for all pages
- Structured data (Schema.org) for artworks and blog posts
- XML sitemap auto-generation
- Robots.txt with proper rules
- Open Graph tags for social sharing
- Twitter card support

## Deployment

### Vercel (Recommended)

```bash
# Connect your GitHub repository
# Environment variables automatically synced
pnpm build
```

### Other Platforms

Ensure Node.js 18+ is installed and run:

```bash
pnpm build
pnpm start
```

## Admin Access

1. Navigate to `/admin/login`
2. Enter your `ADMIN_PASSWORD`
3. Access dashboard at `/admin/dashboard`

Default protected sections:
- `/admin/*` - Requires authentication
- All admin API endpoints

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 12+, Android 8+)

## License

Proprietary - SR Arts Portfolio

## Support

For issues or questions, contact support or submit a support ticket through the admin dashboard.

---

**Built with** Next.js 16 • React 19 • Tailwind CSS 4 • GSAP • Lenis • Three.js
