import type { Metadata } from 'next';
import { FloatingNavbar } from '@/components/floating-navbar';
import { ProseContent } from '@/components/prose-content';
import { getStaticPage } from '@/lib/db-server';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Privacy Policy | SR Arts',
  description: 'Privacy policy for SR Arts — how we collect, use, and protect your data.',
  robots: { index: true, follow: true },
};

const DEFAULT_PRIVACY = `
<h2>1. Information We Collect</h2>
<p>When you use SR Arts Official, we may collect the following information:</p>
<ul>
<li><strong>Account information</strong> — name, email address, and profile picture provided via Clerk authentication</li>
<li><strong>Content you create</strong> — community posts, comments, and any other content you publish on the platform</li>
<li><strong>Usage data</strong> — pages visited, artwork views, and interaction events (used to improve the platform)</li>
<li><strong>Technical data</strong> — IP address, browser type, device information, and cookies for session management</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide and improve the SR Arts Official platform</li>
<li>Display your profile and content to other community members</li>
<li>Send important notifications about your account or content</li>
<li>Analyse usage patterns to improve platform features</li>
<li>Ensure the security and integrity of the platform</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We do not sell your personal information. We may share your information only:</p>
<ul>
<li>With service providers who help us operate the platform (Clerk, Cloudinary, Vercel)</li>
<li>When required by law or to protect the rights and safety of our users</li>
<li>With your explicit consent</li>
</ul>

<h2>4. Data Storage and Security</h2>
<p>Your data is stored securely using industry-standard encryption. We use CockroachDB for database storage and Cloudinary for media files. We implement appropriate technical and organisational measures to protect your information against unauthorised access, alteration, disclosure, or destruction.</p>

<h2>5. Cookies</h2>
<p>We use essential cookies to maintain your session and authentication state. We do not use advertising cookies or third-party tracking cookies.</p>

<h2>6. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access the personal information we hold about you</li>
<li>Request correction of inaccurate information</li>
<li>Request deletion of your account and associated data</li>
<li>Export your content and data</li>
</ul>
<p>To exercise these rights, please contact us through the platform.</p>

<h2>7. Third-Party Services</h2>
<p>Our platform uses the following third-party services, each with their own privacy policies:</p>
<ul>
<li><strong>Clerk</strong> — Authentication and user management</li>
<li><strong>Cloudinary</strong> — Image storage and delivery</li>
<li><strong>Vercel</strong> — Platform hosting and analytics</li>
</ul>

<h2>8. Children's Privacy</h2>
<p>SR Arts Official is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.</p>

<h2>9. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform. Your continued use of the platform after changes constitutes acceptance of the updated policy.</p>

<h2>10. Contact Us</h2>
<p>If you have questions or concerns about this Privacy Policy, please contact us through the SR Arts Official platform.</p>
`;

export default async function PrivacyPage() {
  const page = await getStaticPage('privacy');

  const title   = page?.title   ?? 'Privacy Policy';
  const content = page?.content ?? DEFAULT_PRIVACY;

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
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-blue-600" />
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

          {/* Summary card */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 space-y-1">
            <p className="font-semibold">Your privacy matters to us.</p>
            <p>We collect minimal data, never sell it, and give you full control over your information.</p>
          </div>

          {/* ── Rich content from Tiptap / admin editor ─────────────────── */}
          <ProseContent
            html={content}
            size="lg"
            className="mb-10"
          />

          {/* Navigation links */}
          <div className="pt-8 border-t border-border flex flex-wrap gap-4">
            <Link href="/terms" className="text-sm font-medium text-primary hover:underline">
              Terms & Conditions →
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
