'use client';
/**
 * components/community/create-post-card.tsx
 *
 * LinkedIn-style "tap to create a post" prompt card.
 * Replaces the inline textarea — clicking navigates to /community/create
 * for the full-page TipTap editor experience.
 */

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PenLine, ImageIcon, Repeat2 } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';

export function CreatePostCard() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return null;

  // Unauthenticated prompt
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-border rounded-2xl p-5 shadow-sm"
    >
      {/* Main prompt row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {user?.imageUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
            <Image
              src={user.imageUrl}
              alt={user.fullName ?? ''}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-sm">
              {(user?.fullName ?? user?.username ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Clickable prompt */}
        <button
          onClick={() => router.push('/community/create')}
          className="flex-1 text-left px-4 py-2.5 rounded-xl border border-border bg-accent-subtle/40
            text-sm text-muted-foreground/70 hover:bg-accent-subtle hover:border-primary/30
            hover:text-muted-foreground transition-all duration-200 cursor-text"
        >
          {`What's on your mind, ${user?.firstName ?? 'there'}?`}
        </button>
      </div>

      {/* Quick-action buttons */}
      <div className="flex items-center gap-1 pt-3 mt-3 border-t border-border">
        <button
          onClick={() => router.push('/community/create?mode=photo')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
            text-muted-foreground hover:bg-accent-subtle hover:text-primary transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          Photo
        </button>
        <button
          onClick={() => router.push('/community/create')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
            text-muted-foreground hover:bg-accent-subtle hover:text-primary transition-colors"
        >
          <PenLine className="w-4 h-4" />
          Write post
        </button>
        <button
          onClick={() => router.push('/community/create')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
            text-muted-foreground hover:bg-accent-subtle hover:text-green-600 transition-colors ml-auto"
        >
          <Repeat2 className="w-4 h-4" />
          Repost
        </button>
      </div>
    </motion.div>
  );
}
