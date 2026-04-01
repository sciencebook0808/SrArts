'use client';
/**
 * ArtworkLikeButton — requires Clerk sign-in to like.
 * Shows auth modal prompt if user is not signed in.
 */
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, SignInButton } from '@clerk/nextjs';

interface Props { artworkId: string; initialCount?: number; }

export function ArtworkLikeButton({ artworkId, initialCount = 0 }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const [count, setCount]     = useState(initialCount);
  const [liked, setLiked]     = useState(false);
  const [pending, setPending] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    fetch(`/api/likes/${artworkId}`)
      .then(r => r.json())
      .then((d: { count?: number; liked?: boolean }) => {
        if (typeof d.count  === 'number')  setCount(d.count);
        if (typeof d.liked  === 'boolean') setLiked(d.liked);
      })
      .catch(() => {});
  }, [artworkId, isLoaded, isSignedIn]);

  const toggle = async () => {
    if (!isSignedIn) { setShowPrompt(true); setTimeout(() => setShowPrompt(false), 3000); return; }
    if (pending) return;
    setPending(true);
    const willLike = !liked;
    setLiked(willLike);
    setCount(c => c + (willLike ? 1 : -1));
    try {
      const res = await fetch(`/api/likes/${artworkId}`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json() as { count?: number; liked?: boolean };
        if (typeof d.count  === 'number')  setCount(d.count);
        if (typeof d.liked  === 'boolean') setLiked(d.liked);
      } else {
        setLiked(!willLike); setCount(c => c + (willLike ? -1 : 1));
      }
    } catch {
      setLiked(!willLike); setCount(c => c + (willLike ? -1 : 1));
    } finally { setPending(false); }
  };

  return (
    <div className="relative inline-flex flex-col items-start">
      <button
        onClick={() => void toggle()}
        disabled={pending}
        aria-label={liked ? 'Unlike this artwork' : 'Like this artwork'}
        className={[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold',
          'transition-all duration-200 select-none',
          liked
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            : 'bg-white border-border text-foreground/70 hover:bg-red-50 hover:text-red-500 hover:border-red-200',
          pending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <motion.div
          key={liked ? 'liked' : 'not'}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </motion.div>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="tabular-nums min-w-[1.5ch] inline-block text-center"
          >
            {count}
          </motion.span>
        </AnimatePresence>
        <span>{liked ? 'Liked' : 'Like'}</span>
      </button>

      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 z-20 bg-white border border-border rounded-xl shadow-lg p-3 text-sm whitespace-nowrap"
          >
            <span className="text-foreground/70">Sign in to like • </span>
            <SignInButton mode="modal">
              <button className="text-primary font-semibold hover:underline">Sign in</button>
            </SignInButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
