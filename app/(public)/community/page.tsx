import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { FloatingNavbar } from '@/components/floating-navbar';
import { CommunityFeed } from '@/components/community/feed';
import { AdSlot } from '@/components/ad-slot';
import { getCommunityPosts, getPublicStats } from '@/lib/db-server';
import { CommunityPageHeader } from '@/components/community/page-header';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Community | SR Arts Official',
  description: 'Connect with the SR Arts community. Share thoughts, artwork discoveries, and your creative journey.',
  openGraph: {
    title: 'Community | SR Arts Official',
    description: 'Connect with art lovers worldwide. Share, like, and discover.',
    type: 'website',
  },
};

export default async function CommunityPage() {
  const [initialPosts, stats] = await Promise.all([
    getCommunityPosts({ take: 20, skip: 0, sort: 'latest' }),
    getPublicStats(),
  ]);

  return (
    <main className="w-full min-h-screen bg-[#f4f2ef] overflow-x-hidden">
      <FloatingNavbar />
      <CommunityPageHeader />

      <div className="pt-6 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

            {/* ── Feed (left column) ───────────────────────────────────── */}
            <div>
              <CommunityFeed initialPosts={initialPosts} />
            </div>

            {/* ── Sidebar (right, desktop only) ────────────────────────── */}
            <aside className="hidden lg:block space-y-4 sticky top-28">

              {/* About */}
              <div
                className="bg-white border border-border rounded-2xl p-5 shadow-sm"
                style={{ animation: 'fadeSlideIn 0.55s ease-out 0.2s both' }}
              >
                <h3 className="font-bold text-base mb-2">About this Community</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A space for art enthusiasts and collectors to share inspiration,
                  ask questions, and celebrate creativity.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-2.5 bg-accent-subtle rounded-xl">
                    <p className="font-bold text-primary text-lg">{stats.followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center p-2.5 bg-accent-subtle rounded-xl">
                    <p className="font-bold text-primary text-lg">{stats.posts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                </div>

                {/* Desktop create post CTA */}
                <Link
                  href="/community/create"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5
                    bg-primary text-white text-sm font-semibold rounded-xl
                    hover:bg-primary-light transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Post
                </Link>
              </div>

              {/* Guidelines */}
              <div
                className="bg-white border border-border rounded-2xl p-5 shadow-sm"
                style={{ animation: 'fadeSlideIn 0.55s ease-out 0.35s both' }}
              >
                <h3 className="font-bold text-base mb-3">Guidelines</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    'Be respectful and kind',
                    'Share original content',
                    'Credit artists appropriately',
                    'No spam or self-promotion',
                  ].map(rule => (
                    <li key={rule} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✦</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <AdSlot slot="community-sidebar" format="rectangle" />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
