import type { Metadata } from 'next';
import { FloatingNavbar } from '@/components/floating-navbar';
import { CommunityFeed } from '@/components/community/feed';
import { AdSlot } from '@/components/ad-slot';
import { getCommunityPosts } from '@/lib/db-server';

export const revalidate = 0; // Always fresh — community feed is real-time

export const metadata: Metadata = {
  title: 'Community | SR Arts',
  description: 'Connect with the SR Arts community. Share your thoughts, artwork discoveries, and creative journey.',
};

export default async function CommunityPage() {
  const initialPosts = await getCommunityPosts({ take: 20, skip: 0 });

  return (
    <main className="w-full min-h-screen bg-[#f4f2ef]">
      <FloatingNavbar />

      <div className="pt-28 md:pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Community</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Connect with fellow art lovers, share your creative journey, and discover new perspectives.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
            {/* Feed */}
            <div>
              <CommunityFeed initialPosts={initialPosts} />
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-4 sticky top-28">
              {/* About card */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-base mb-2">About this Community</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A space for art enthusiasts and collectors to share inspiration, ask questions, and celebrate creativity.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-2 bg-accent-subtle rounded-xl">
                    <p className="font-bold text-primary text-lg">50K+</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center p-2 bg-accent-subtle rounded-xl">
                    <p className="font-bold text-primary text-lg">500+</p>
                    <p className="text-xs text-muted-foreground">Artworks</p>
                  </div>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-sm mb-3">Community Guidelines</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {[
                    'Be respectful and kind',
                    'Share original or credited content',
                    'No spam or self-promotion only',
                    'Keep it art-related',
                  ].map(rule => (
                    <li key={rule} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ad slot */}
              <AdSlot slot="community-sidebar" format="rectangle" />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
