import type { Metadata } from 'next';
import { FloatingNavbar } from '@/components/floating-navbar';
import { getStaticPage } from '@/lib/db-server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Terms & Conditions | SR Arts',
  description: 'Terms and conditions for using SR Arts services.',
  robots: { index: true, follow: true },
};

export default async function TermsPage() {
  const page = await getStaticPage('terms');

  const title   = page?.title   ?? 'Terms & Conditions';
  const content = page?.content ?? '<p>Terms and conditions coming soon.</p>';

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      <div className="pt-24 md:pt-28 px-4 md:px-8 pb-20">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{title}</h1>

          {page?.updatedAt && (
            <p className="text-sm text-muted-foreground mb-10">
              Last updated:{' '}
              {new Date(page.updatedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}

          <div
            className="prose prose-lg max-w-none prose-headings:font-extrabold prose-a:text-primary prose-blockquote:border-primary"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      <footer className="py-10 px-4 md:px-8 border-t border-border bg-accent-subtle/20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SR Arts. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms"   className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
