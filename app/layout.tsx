import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LenisProvider } from '@/lib/lenis-provider';
// ✅ Sonner v2: <Toaster /> MUST be in layout — toasts won't render without it.
// v2 uses constructable stylesheets; without mounting <Toaster /> the styles
// are never injected and toasts are invisible.
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'SR Arts — Premium Artistic Experience',
    template: '%s | SR Arts',
  },
  description:
    'Explore stunning artwork and commission custom pieces. Each creation is crafted with precision and passion.',
  openGraph: {
    type: 'website',
    siteName: 'SR Arts',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LenisProvider>
            {children}
          </LenisProvider>

          {/*
           * Sonner v2 <Toaster /> — required here in the root layout.
           * position="top-center" works for both mobile and desktop.
           * richColors enables the green/red success/error colour coding.
           * expand={false} keeps toasts stacked rather than fanned out.
           */}
          <Toaster
            position="top-center"
            richColors
            expand={false}
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
