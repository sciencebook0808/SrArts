import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { LenisProvider } from '@/lib/lenis-provider';
import { Toaster } from 'sonner';
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sr-arts.com';

// ─── Google Ads & Meta Pixel IDs ──────────────────────────────────────────────
// Add these to your .env.local — leave blank to disable that ad network
const GOOGLE_ADS_ID  = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID   ?? ''; // e.g. AW-1234567890
const META_PIXEL_ID  = process.env.NEXT_PUBLIC_META_PIXEL_ID   ?? ''; // e.g. 1234567890123456
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''; // e.g. G-XXXXXXXXXX

export const metadata: Metadata = {
  title:       { default: 'SR Arts — Premium Artist Portfolio', template: '%s | SR Arts' },
  description: 'Explore stunning artwork and commission custom pieces. Premium artistic experience with gallery, blog, and commissions.',
  keywords:    ['art', 'artist', 'portfolio', 'commission', 'digital art', 'anime art', 'gallery', 'illustration'],
  authors:     [{ name: 'SR Arts' }],
  creator:     'SR Arts',
  publisher:   'SR Arts',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website', locale: 'en_US', url: BASE_URL,
    title: 'SR Arts — Premium Artist Portfolio',
    description: 'Explore stunning artwork and commission custom pieces.',
    siteName: 'SR Arts',
  },
  twitter: { card: 'summary_large_image', creator: '@sr_arts' },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)'  },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  verification: {
    // Add your Search Console verification token to .env.local
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': [process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION] }
      : undefined,
  },
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 5, userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f8f6' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── Google Analytics (GA4) ─────────────────────────────────────── */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}

        {/* ── Google Ads (Conversion Tracking) ───────────────────────────── */}
        {/* Google Ads reuses the same gtag.js as GA4 if both are present.    */}
        {/* If only Google Ads (no GA4), this loads the tag separately.        */}
        {GOOGLE_ADS_ID && !GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GOOGLE_ADS_ID}');
              `}
            </Script>
          </>
        )}
        {/* If both GA4 and Google Ads are present, just add the Ads config  */}
        {GOOGLE_ADS_ID && GA_MEASUREMENT_ID && (
          <Script id="google-ads-config" strategy="afterInteractive">
            {`gtag('config', '${GOOGLE_ADS_ID}');`}
          </Script>
        )}

        {/* ── Meta (Facebook) Pixel ──────────────────────────────────────── */}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            {/* Fallback for browsers with JavaScript disabled */}
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1" width="1" style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LenisProvider>{children}</LenisProvider>
        {/* Sonner v2: <Toaster> MUST be here — without it all toasts are silent */}
        <Toaster position="top-center" richColors expand={false} closeButton />
        <Analytics />
      </body>
    </html>
  );
}
