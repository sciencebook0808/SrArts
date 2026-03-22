/**
 * app/[username]/page.tsx
 *
 * Instagram-style public user profile.
 * Route: /[username]  (e.g. /anubhav)
 *
 * - Loads Clerk user data by username via clerkClient()
 * - Loads all their community posts from DB
 * - Shows stats: post count, likes received, join date
 * - Grid (artwork/image posts) + list (all posts) view
 * - Own profile: shows edit-profile button (links to Clerk UserProfile)
 * - Fully SEO-optimised with dynamic metadata
 * - Scroll-to-top link per post → /[username]/community/[slug]
 *
 * RESERVED ROUTES are static and matched before this dynamic segment,
 * so /gallery, /blog, /about, etc. are never captured here.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { getCommunityPosts } from '@/lib/db-server';
import { FloatingNavbar } from '@/components/floating-navbar';
import { UserProfileClient } from '@/components/user-profile-client';

// ─── Reserved path segments that must never match as usernames ───────────────
const RESERVED = new Set([
  'about','gallery','blog','commission','community','admin','api',
  'terms','privacy','sign-in','sign-up','user','favicon.ico',
]);

interface Props {
  params: Promise<{ username: string }>;
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  if (RESERVED.has(username)) return {};

  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ username: [username] });
    const user = users[0];
    if (!user) return { title: 'User not found | SR Arts' };

    const displayName = user.fullName ?? user.username ?? username;
    const description = `${displayName}'s profile on SR Arts — see their community posts, artwork shares, and creative activity.`;

    return {
      title: `${displayName} (@${username}) | SR Arts`,
      description,
      openGraph: {
        title: `${displayName} (@${username}) | SR Arts`,
        description,
        images: user.imageUrl ? [{ url: user.imageUrl }] : [],
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title: `${displayName} (@${username})`,
        description,
        images: user.imageUrl ? [user.imageUrl] : [],
      },
    };
  } catch {
    return { title: 'Profile | SR Arts' };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;

  // Block reserved routes from being treated as usernames
  if (RESERVED.has(username)) notFound();

  // ── Clerk user lookup ──────────────────────────────────────────────────────
  let userData: {
    id: string;
    username: string | null;
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    createdAt: number;
    publicMetadata: Record<string, unknown>;
  };

  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ username: [username] });
    const user = users[0];
    if (!user) notFound();

    userData = {
      id:             user.id,
      username:       user.username,
      fullName:       user.fullName,
      firstName:      user.firstName,
      lastName:       user.lastName,
      imageUrl:       user.imageUrl,
      createdAt:      user.createdAt,
      publicMetadata: (user.publicMetadata as Record<string, unknown>) ?? {},
    };
  } catch {
    notFound();
  }

  // ── Community posts by this user ───────────────────────────────────────────
  const posts = await getCommunityPosts({ take: 60, authorId: userData.id });

  // ── Current viewer ─────────────────────────────────────────────────────────
  const { userId: viewerId } = await auth();
  const isOwnProfile = viewerId === userData.id;

  // Compute stats
  const totalLikesReceived = posts.reduce((sum, p) => sum + p.likesCount, 0);
  const imagePosts = posts.filter(p => p.imageUrl);

  return (
    <main className="w-full min-h-screen bg-[#fafafa]">
      <FloatingNavbar />
      <UserProfileClient
        user={userData}
        posts={posts}
        isOwnProfile={isOwnProfile}
        stats={{
          postCount:    posts.length,
          likesReceived: totalLikesReceived,
          imagePosts:   imagePosts.length,
        }}
      />
    </main>
  );
}
