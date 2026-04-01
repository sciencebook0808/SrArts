import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { LenisProvider } from '@/lib/lenis-provider';
import { CursorTrail } from '@/components/cursor-trail';
import { Toaster } from 'sonner';
import { NotificationBanner } from '@/components/notification-banner';
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';

const GA_ID           = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID  ?? '';
const GOOGLE_ADS_ID   = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID      ?? '';
const META_PIXEL_ID   = process.env.NEXT_PUBLIC_META_PIXEL_ID      ?? '';
const ADSENSE_CLIENT  = process.env.NEXT_PUBLIC_ADSENSE_CLIENT      ?? '';
const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';

export const metadata: Metadata = {
  title:       { default: 'SR Arts Official — Premium Artist Portfolio', template: '%s | SR Arts Official' },
  description: 'Explore stunning original artwork, commission custom pieces, and connect with a creative community.',
  keywords:    ['art', 'artist', 'portfolio', 'commission', 'digital art', 'anime art', 'gallery', 'illustration'],
  authors:     [{ name: 'Anubhav Yadav' }],
  creator:     'SR Arts Official',
  publisher:   'SR Arts Official',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website', locale: 'en_US', url: BASE_URL,
    title: 'SR Arts Official — Premium Artist Portfolio',
    description: 'Explore stunning original artwork and commission custom pieces.',
    siteName: 'SR Arts Official',
  },
  twitter: { card: 'summary_large_image', creator: '@sr_arts' },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    other: [{ rel: 'manifest', url: '/site.webmanifest' }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? undefined,
  },
};

export const viewport: Viewport = {
  width:          'device-width',
  initialScale:   1,
  maximumScale:   5,
  // interactive-widget=resizes-content: makes the browser shrink the visual
  // viewport when the software keyboard opens, enabling env(keyboard-inset-bottom)
  // to work correctly in the comment drawer input on iOS/Android.
  // Supported: Chrome 108+, Safari 16+ (iOS 16.4+)
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f8f6' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* ── Critical resource hints — reduces LCP by 200-500ms ─────────── */}
          {/* Cloudinary CDN — all artwork images served from here */}
          <link rel="preconnect" href="https://res.cloudinary.com" />
          {/* Clerk CDN — user avatars */}
          <link rel="preconnect" href="https://img.clerk.com" />
          {/* Google Fonts — used in globals.css */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* ── Google Analytics ──────────────────────────────────────────── */}
          {GA_ID && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
              <Script id="ga4" strategy="afterInteractive">{`
                window.dataLayer=window.dataLayer||[];
                function gtag(){dataLayer.push(arguments);}
                gtag('js',new Date());
                gtag('config','${GA_ID}',{page_path:window.location.pathname});
              `}</Script>
            </>
          )}

          {/* ── Google Ads ────────────────────────────────────────────────── */}
          {GOOGLE_ADS_ID && !GA_ID && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
              <Script id="gads-init" strategy="afterInteractive">{`
                window.dataLayer=window.dataLayer||[];
                function gtag(){dataLayer.push(arguments);}
                gtag('js',new Date());
                gtag('config','${GOOGLE_ADS_ID}');
              `}</Script>
            </>
          )}
          {GOOGLE_ADS_ID && GA_ID && (
            <Script id="gads-config" strategy="afterInteractive">{`gtag('config','${GOOGLE_ADS_ID}');`}</Script>
          )}

          {/* ── Meta Pixel ────────────────────────────────────────────────── */}
          {META_PIXEL_ID && (
            <Script id="meta-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
              n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
              s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
              (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${META_PIXEL_ID}');fbq('track','PageView');
            `}</Script>
          )}

          {/* ── AdSense ───────────────────────────────────────────────────── */}
          {ADSENSE_ENABLED && ADSENSE_CLIENT && (
            <Script
              id="adsense"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
          )}
          {/* ── JSON-LD structured data — fixes Google showing wrong site name ── */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "SR Arts Official",
                "alternateName": "SR Arts",
                "url": BASE_URL,
                "description": "Explore stunning original artwork, commission custom pieces, and connect with a creative community of art lovers.",
                "publisher": {
                  "@type": "Person",
                  "name": "Anubhav Yadav",
                  "url": BASE_URL,
                  "sameAs": [
                    "https://www.instagram.com/sr_arts_official",
                    "https://www.youtube.com/@sr_arts_official"
                  ]
                },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${BASE_URL}/gallery?q={{search_term_string}}`
                  },
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Site-wide notification banner — sits above the navbar (z-70) */}
          <NotificationBanner />
          <LenisProvider>
            {children}
          </LenisProvider>

          {/* Custom cursor — renders null on mobile */}
          <CursorTrail />

          <Toaster
            position="top-center"
            richColors
            expand={false}
            closeButton
            toastOptions={{
              classNames: {
                toast: 'rounded-2xl shadow-lg font-medium',
              },
            }}
          />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
