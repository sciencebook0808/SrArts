'use client';
/**
 * components/community/create-post.tsx
 *
 * Legacy inline post creation — kept for backward compatibility.
 * New flow: CreatePostCard → /community/create (full page editor).
 * This component is no longer rendered in the feed (replaced by CreatePostCard).
 * Kept to avoid breaking any direct imports.
 */

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser, SignInButton } from '@clerk/nextjs';

interface Props { onCreated?: () => void; }

export function CreatePost({ onCreated: _onCreated }: Props) {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Sign in to share with the community</p>
        <SignInButton mode="modal">
          <button className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors">
            Sign in
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/community/create')}
      className="w-full bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow text-left"
    >
      {user?.imageUrl ? (
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
          <Image src={user.imageUrl} alt={user.fullName ?? ''} width={40} height={40} className="object-cover" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold">{(user?.fullName ?? 'U')[0]}</span>
        </div>
      )}
      <span className="text-sm text-muted-foreground/70 px-4 py-2.5 rounded-xl border border-border/60 flex-1">
        {`What's on your mind, ${user?.firstName ?? 'there'}?`}
      </span>
    </button>
  );
}
