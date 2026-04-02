import type { Metadata } from 'next';
import { FloatingNavbar } from '@/components/floating-navbar';
import { ProseContent } from '@/components/prose-content';
import { getStaticPage } from '@/lib/db-server';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Terms & Conditions | SR Arts',
  description: 'Terms and conditions for using SR Arts services.',
  robots: { index: true, follow: true },
};

const DEFAULT_TERMS = `
<h2>1. Acceptance of Terms</h2>
<p>By accessing and using SR Arts Official, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

<h2>2. Use of the Platform</h2>
<p>SR Arts Official is an artist portfolio and community platform. You may use the platform to browse artwork, engage with community posts, and interact with creative content. You agree not to misuse the platform or its content.</p>

<h2>3. Intellectual Property</h2>
<p>All artwork, content, and materials displayed on SR Arts Official are the intellectual property of their respective owners. You may not reproduce, distribute, or create derivative works without explicit written permission.</p>

<h2>4. Community Guidelines</h2>
<p>When participating in the community, you agree to:</p>
<ul>
<li>Be respectful and constructive in all interactions</li>
<li>Not post spam, hateful, or inappropriate content</li>
<li>Credit artists appropriately when referencing their work</li>
<li>Not engage in self-promotion without prior consent</li>
</ul>

<h2>5. Privacy</h2>
<p>Your use of SR Arts Official is also governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>

<h2>6. Limitation of Liability</h2>
<p>SR Arts Official is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform.</p>

<h2>7. Changes to Terms</h2>
<p>We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>

<h2>8. Contact</h2>
<p>If you have questions about these Terms, please contact us through the platform.</p>
`;

export default async function TermsPage() {
  const page = await getStaticPage('terms');

  const title   = page?.title   ?? 'Terms & Conditions';
  const content = page?.content ?? DEFAULT_TERMS;

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      <div className="pt-24 md:pt-28 px-4 md:px-8 pb-20">
        <div className="max-w-3xl mx-auto">

          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
          </div>

          {page?.updatedAt && (
            <p className="text-sm text-muted-foreground mb-10 ml-14">
              Last updated:{' '}
              {new Date(page.updatedAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}

          {/* Legal notice */}
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            Please read these terms carefully before using SR Arts Official. By using our platform you agree to all terms below.
          </div>

          {/* ── Rich content from Tiptap / admin editor ─────────────────── */}
          <ProseContent
            html={content}
            size="lg"
            className="mb-10"
          />

          {/* Navigation links */}
          <div className="pt-8 border-t border-border flex flex-wrap gap-4">
            <Link href="/privacy" className="text-sm font-medium text-primary hover:underline">
              Privacy Policy →
            </Link>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
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
