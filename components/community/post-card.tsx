'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Repeat2, Share2,
  MoreHorizontal, Trash2, Quote,
} from 'lucide-react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { CommentsSection } from '@/components/comments-section';
import type { CommunityPostWithRepost } from '@/lib/db-server';

function timeAgo(d: string | Date): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60)     return 'just now';
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Repost editor modal ──────────────────────────────────────────────────────
interface RepostEditorProps {
  post: CommunityPostWithRepost;
  onDone: () => void;
  onCancel: () => void;
}

function RepostEditor({ post, onDone, onCancel }: RepostEditorProps) {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
                  <Image
                    src={post.authorImage}
                    alt={post.authorName}
                    width={20}
                    height={20}
                    className="object-cover"
                  />
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

// ── PostCard ─────────────────────────────────────────────────────────────────
interface PostCardProps {
  post: CommunityPostWithRepost;
  currentUserId?: string;
  onDeleted?: (id: string) => void;
}

export function PostCard({ post, currentUserId, onDeleted }: PostCardProps) {
  const { isSignedIn }              = useAuth();
  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [showRepost, setShowRepost]     = useState(false);
  const [showMenu, setShowMenu]         = useState(false);
  const [repostCount, setRepostCount]   = useState(post.repostsCount);
  const [authPrompt, setAuthPrompt]     = useState('');

  // ── Fetch initial like state ──────────────────────────────────────────────
  const fetchLikeState = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/${post.id}/like`);
      if (!res.ok) return;
      const d = await res.json() as { count?: number; liked?: boolean };
      if (typeof d.liked  === 'boolean') setLiked(d.liked);
      if (typeof d.count  === 'number')  setLikeCount(d.count);
    } catch { /* non-critical */ }
  }, [post.id]);

  // Fix: was wrongly using useState(() => {...}) — must be useEffect
  useEffect(() => {
    void fetchLikeState();
  }, [fetchLikeState]);

  // ── Like toggle ───────────────────────────────────────────────────────────
  const toggleLike = async () => {
    if (!isSignedIn) {
      setAuthPrompt('like');
      setTimeout(() => setAuthPrompt(''), 3000);
      return;
    }
    const willLike = !liked;
    setLiked(willLike);
    setLikeCount(c => c + (willLike ? 1 : -1));
    try {
      const res = await fetch(`/api/community/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json() as { count?: number; liked?: boolean };
        if (typeof d.count  === 'number')  setLikeCount(d.count);
        if (typeof d.liked  === 'boolean') setLiked(d.liked);
      } else {
        setLiked(!willLike);
        setLikeCount(c => c + (willLike ? -1 : 1));
      }
    } catch {
      setLiked(!willLike);
      setLikeCount(c => c + (willLike ? -1 : 1));
    }
  };

  const handleRepostClick = () => {
    if (!isSignedIn) {
      setAuthPrompt('repost');
      setTimeout(() => setAuthPrompt(''), 3000);
      return;
    }
    setShowRepost(true);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/community/${post.id}`, { method: 'DELETE' });
      onDeleted?.(post.id);
    } catch { /* non-critical */ }
  };

  const handleShare = () => {
    void navigator.clipboard.writeText(
      `${window.location.origin}/community/${post.id}`
    );
  };

  const isOwner = currentUserId === post.authorId;

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            {post.authorImage ? (
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
                <Image
                  src={post.authorImage}
                  alt={post.authorName}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">
                  {post.authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-sm leading-tight">{post.authorName}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(v => !v)}
                className="p-1.5 rounded-lg hover:bg-accent-subtle text-muted-foreground transition-colors"
                aria-label="Post options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-xl shadow-xl overflow-hidden min-w-[130px]"
                  >
                    <button
                      onClick={() => { void handleDelete(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* ── Attached image ─────────────────────────────────────────────── */}
        {post.imageUrl && (
          <div className="relative w-full aspect-video bg-accent-subtle">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 600px"
            />
          </div>
        )}

        {/* ── Repost quote ───────────────────────────────────────────────── */}
        {post.repostOf && (
          <div className="mx-4 mb-3 border border-border rounded-xl p-3 bg-accent-subtle/30">
            <div className="flex items-center gap-2 mb-1.5">
              {post.repostOf.authorImage && (
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={post.repostOf.authorImage}
                    alt={post.repostOf.authorName}
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                </div>
              )}
              <span className="font-semibold text-xs">{post.repostOf.authorName}</span>
              <span className="text-xs text-muted-foreground">
                · {timeAgo(post.repostOf.createdAt)}
              </span>
            </div>
            <p className="text-xs text-foreground/70 line-clamp-3">{post.repostOf.content}</p>
            {post.repostOf.imageUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-2 bg-accent-subtle">
                <Image
                  src={post.repostOf.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Action bar ─────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-border flex items-center gap-1">

          {/* Like */}
          <div className="relative">
            <button
              onClick={() => void toggleLike()}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                liked
                  ? 'text-red-500 bg-red-50'
                  : 'text-muted-foreground hover:bg-accent-subtle hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
              <span className="tabular-nums">{likeCount}</span>
            </button>
            <AnimatePresence>
              {authPrompt === 'like' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-full mb-2 left-0 bg-white border border-border rounded-xl shadow-lg px-3 py-2 text-xs whitespace-nowrap z-10"
                >
                  <SignInButton mode="modal">
                    <button className="text-primary font-semibold">Sign in to like</button>
                  </SignInButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comment */}
          <button
            onClick={() => setShowComments(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              showComments
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:bg-accent-subtle hover:text-primary'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="tabular-nums">{post.commentsCount}</span>
          </button>

          {/* Repost */}
          <div className="relative">
            <button
              onClick={handleRepostClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent-subtle hover:text-green-600 transition-all"
            >
              <Repeat2 className="w-4 h-4" />
              <span className="tabular-nums">{repostCount}</span>
            </button>
            <AnimatePresence>
              {authPrompt === 'repost' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-full mb-2 left-0 bg-white border border-border rounded-xl shadow-lg px-3 py-2 text-xs whitespace-nowrap z-10"
                >
                  <SignInButton mode="modal">
                    <button className="text-primary font-semibold">Sign in to repost</button>
                  </SignInButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent-subtle hover:text-blue-500 transition-all ml-auto"
            aria-label="Copy link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* ── Comments (expandable) ──────────────────────────────────────── */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="p-4">
                <CommentsSection
                  targetId={post.id}
                  targetType="community"
                  title="Replies"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      {/* ── Repost Editor Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showRepost && (
          <RepostEditor
            post={post}
            onDone={() => {
              setShowRepost(false);
              setRepostCount(c => c + 1);
            }}
            onCancel={() => setShowRepost(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
