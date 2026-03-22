'use client';
/**
 * components/community/post-detail.tsx
 *
 * Full individual community post view.
 * Used on /community/[slug] and /[username]/community/[slug]
 *
 * Features:
 * - Full post content (no line-clamp)
 * - Like / Repost / Share
 * - Comments section
 * - Author card linking to /[username]
 * - "Back" navigation
 */

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Repeat2, Share2, Quote,
  ArrowLeft, Clock, CheckCheck,
} from 'lucide-react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { CommentsSection } from '@/components/comments-section';
import { toast } from 'sonner';
import type { CommunityPostWithRepost } from '@/lib/db-server';

function timeAgo(d: string | Date): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60)     return 'just now';
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Repost modal ─────────────────────────────────────────────────────────────
function RepostModal({
  post,
  onDone,
  onCancel,
}: {
  post: CommunityPostWithRepost;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/community/${post.id}/repost`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ note }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      toast.success('Reposted successfully!');
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Quote className="w-5 h-5 text-primary" />
            Repost with your thoughts
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add your thoughts about this post…"
            rows={4}
            maxLength={1000}
            autoFocus
            className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          {/* Original post preview */}
          <div className="border border-border rounded-xl p-3 bg-accent-subtle/30">
            <div className="flex items-center gap-2 mb-1.5">
              {post.authorImage && (
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                  <Image src={post.authorImage} alt={post.authorName} width={20} height={20} className="object-cover" />
                </div>
              )}
              <span className="font-semibold text-xs">{post.authorName}</span>
            </div>
            <p className="text-xs text-foreground/70 line-clamp-3">{post.content}</p>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="p-5 border-t border-border flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void submit()}
            disabled={saving}
            className="px-5 py-2 text-sm bg-primary text-white rounded-xl font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors"
          >
            {saving ? 'Reposting…' : 'Repost'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
interface Props {
  post: CommunityPostWithRepost;
  backHref?: string;
}

export function CommunityPostDetail({ post, backHref = '/community' }: Props) {
  const router          = useRouter();
  const { isSignedIn }  = useAuth();
  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(post.likesCount);
  const [repostCount, setRepostCount] = useState(post.repostsCount);
  const [shareCount, setShareCount]   = useState(post.shareCount ?? 0);
  const [showRepost, setShowRepost]   = useState(false);
  const [copied, setCopied]           = useState(false);

  // Fetch live like state
  const fetchLikeState = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/${post.id}/like`);
      if (!res.ok) return;
      const d = await res.json() as { count?: number; liked?: boolean };
      if (typeof d.liked  === 'boolean') setLiked(d.liked);
      if (typeof d.count  === 'number')  setLikeCount(d.count);
    } catch { /* non-critical */ }
  }, [post.id]);

  useEffect(() => { void fetchLikeState(); }, [fetchLikeState]);

  const toggleLike = async () => {
    if (!isSignedIn) {
      toast.info('Sign in to like posts');
      return;
    }
    const will = !liked;
    setLiked(will);
    setLikeCount(c => c + (will ? 1 : -1));
    try {
      const res = await fetch(`/api/community/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json() as { count?: number; liked?: boolean };
        if (typeof d.count  === 'number')  setLikeCount(d.count);
        if (typeof d.liked  === 'boolean') setLiked(d.liked);
      } else {
        setLiked(!will);
        setLikeCount(c => c + (will ? -1 : 1));
      }
    } catch {
      setLiked(!will);
      setLikeCount(c => c + (will ? -1 : 1));
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community/${post.slug ?? post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.authorName} on SR Arts`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Link copied to clipboard!');
      }
      void fetch(`/api/community/${post.id}/share`, { method: 'POST' });
      setShareCount(c => c + 1);
    } catch { /* user cancelled share */ }
  };

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const postUrl = `${siteUrl}/community/${post.slug ?? post.id}`;

  return (
    <>
      {/* ── Back nav ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
      >
        {/* ── Author header ─────────────────────────────────────────────── */}
        <div className="p-5 pb-4 flex items-center gap-3 border-b border-border/50">
          {post.authorImage ? (
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
              <Image
                src={post.authorImage}
                alt={post.authorName}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-lg">
                {post.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight">{post.authorName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* ── Full content ──────────────────────────────────────────────── */}
        <div className="p-5">
          <p className="text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* ── Attached image ────────────────────────────────────────────── */}
        {post.imageUrl && (
          <div className="relative w-full aspect-video bg-accent-subtle">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 672px"
              priority
            />
          </div>
        )}

        {/* ── Repost quote ──────────────────────────────────────────────── */}
        {post.repostOf && (
          <div className="mx-5 mb-4 border border-border rounded-xl p-4 bg-accent-subtle/30">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
              Original post
            </p>
            <div className="flex items-center gap-2 mb-2">
              {post.repostOf.authorImage && (
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={post.repostOf.authorImage}
                    alt={post.repostOf.authorName}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              )}
              <span className="font-semibold text-sm">{post.repostOf.authorName}</span>
              <span className="text-xs text-muted-foreground">· {timeAgo(post.repostOf.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{post.repostOf.content}</p>
            {post.repostOf.imageUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-3 bg-accent-subtle">
                <Image
                  src={post.repostOf.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        {(likeCount > 0 || repostCount > 0 || shareCount > 0) && (
          <div className="px-5 pb-3 flex items-center gap-4 text-xs text-muted-foreground border-b border-border/50">
            {likeCount > 0    && <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>}
            {repostCount > 0  && <span>{repostCount} {repostCount === 1 ? 'repost' : 'reposts'}</span>}
            {shareCount > 0   && <span>{shareCount} shares</span>}
          </div>
        )}

        {/* ── Action bar ────────────────────────────────────────────────── */}
        <div className="px-5 py-3 flex items-center gap-1 border-b border-border/50">
          {/* Like */}
          <button
            onClick={() => void toggleLike()}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              liked
                ? 'text-red-500 bg-red-50'
                : 'text-muted-foreground hover:bg-accent-subtle hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
            <span>{liked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Repost */}
          <button
            onClick={() => {
              if (!isSignedIn) { toast.info('Sign in to repost'); return; }
              setShowRepost(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent-subtle hover:text-green-600 transition-all"
          >
            <Repeat2 className="w-4 h-4" />
            <span>Repost</span>
          </button>

          {/* Share */}
          <button
            onClick={() => void handleShare()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent-subtle hover:text-blue-500 transition-all ml-auto"
          >
            {copied
              ? <><CheckCheck className="w-4 h-4 text-green-500" /><span className="text-green-500">Copied!</span></>
              : <><Share2 className="w-4 h-4" /><span>Share</span></>
            }
          </button>
        </div>

        {/* ── URL display ───────────────────────────────────────────────── */}
        {post.slug && (
          <div className="px-5 py-2.5 bg-accent-subtle/40 border-b border-border/30">
            <p className="text-[11px] text-muted-foreground font-mono truncate select-all">
              {postUrl}
            </p>
          </div>
        )}

        {/* ── Comments ──────────────────────────────────────────────────── */}
        <div className="p-5">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4" />
            Replies
          </h2>
          <CommentsSection
            targetId={post.id}
            targetType="community"
            title=""
          />
        </div>
      </motion.article>

      {/* ── Repost modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showRepost && (
          <RepostModal
            post={post}
            onDone={() => { setShowRepost(false); setRepostCount(c => c + 1); }}
            onCancel={() => setShowRepost(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
