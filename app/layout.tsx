import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LenisProvider } from '@/lib/lenis-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SR Arts - Premium Artist Portfolio',
  description: 'Explore stunning artwork and commission custom pieces from SR Arts. Premium artistic experience with smooth animations and beautiful gallery.',
  generator: 'v0.app',
  keywords: ['art', 'artist', 'portfolio', 'commission', 'artwork', 'gallery'],
  authors: [{ name: 'SR Arts' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sr-arts.com',
    title: 'SR Arts - Premium Artist Portfolio',
    description: 'Explore stunning artwork and commission custom pieces',
    siteName: 'SR Arts',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f8f6' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.className} antialiased`}>
        <LenisProvider>
          {children}
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  )
}
