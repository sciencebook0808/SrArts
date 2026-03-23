'use client';
/**
 * components/community/post-card.tsx
 *
 * LinkedIn-style community post card.
 *
 * REPOST DISPLAY STRUCTURE (exactly like LinkedIn):
 *  1. "Name reposted" badge at top
 *  2. Reposter avatar + name + timestamp
 *  3. Reposter's commentary (their added thoughts)
 *  4. Quoted original post block (bordered card inside)
 *     → Original author name + avatar
 *     → Original content
 *     → Original image (if any)
 *
 * EXTERNAL REFERENCE (artwork / blog repost):
 *  Same structure but the inner block shows artwork/blog card
 *  with type badge, title, thumbnail, and link.
 *
 * Rich HTML content rendered safely for TipTap posts.
 * YouTube iframes rendered inline.
 */

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Repeat2, Share2,
  MoreHorizontal, Trash2, CheckCheck,
  ExternalLink, ImageIcon, BookOpen, MessageSquare,
} from 'lucide-react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { CommentsSection } from '@/components/comments-section';
import { toast } from 'sonner';
import type { CommunityPost, CommunityPostWithRepost } from '@/lib/db-server';

function timeAgo(d: string | Date): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60)     return 'just now';
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Content renderer — handles both plain text and HTML ─────────────────────
function PostContent({ content, clamp = true }: { content: string; clamp?: boolean }) {
  const isHtml = content.trimStart().startsWith('<');
  if (isHtml) {
    return (
      <div
        className={[
          'prose prose-sm max-w-none',
          'prose-headings:font-extrabold prose-headings:text-foreground prose-headings:my-2',
          'prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:my-1',
          'prose-strong:font-bold prose-strong:text-foreground',
          'prose-a:text-primary prose-a:underline prose-a:underline-offset-2',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-3',
          'prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-2',
          'prose-ul:list-disc prose-ol:list-decimal prose-li:text-foreground/90',
          'prose-img:rounded-xl prose-img:shadow-sm prose-img:my-3',
          'prose-code:bg-accent-subtle prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
          'prose-hr:border-border',
          '[&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:my-3 [&_iframe]:aspect-video [&_iframe]:border-0',
          clamp ? 'line-clamp-[8]' : '',
        ].join(' ')}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <p className={`text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 ${clamp ? 'line-clamp-6' : ''}`}>
      {content}
    </p>
  );
}

// ── External reference preview card (artwork / blog) ────────────────────────
function ExternalReferenceCard({
  type, title, image, slug,
}: {
  type: 'artwork' | 'blog';
  title: string;
  image: string | null;
  slug: string;
}) {
  const href  = type === 'artwork' ? `/gallery/${slug}` : `/blog/${slug}`;
  const Icon  = type === 'artwork' ? ImageIcon : BookOpen;
  const label = type === 'artwork' ? 'Artwork' : 'Blog Post';
  const color = type === 'artwork'
    ? 'text-primary bg-primary/10'
    : 'text-blue-600 bg-blue-50';

  return (
    <Link href={href} className="group block">
      <div className="border border-border rounded-xl overflow-hidden bg-white hover:border-primary/40 hover:shadow-sm transition-all">
        <div className="px-3 pt-3 pb-2 flex items-center gap-2 border-b border-border/40">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
          </span>
          <ExternalLink className="w-3 h-3 text-muted-foreground/40 ml-auto group-hover:text-primary transition-colors" />
        </div>
        <div className="flex gap-3 p-3">
          {image && (
            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-accent-subtle">
              <Image src={image} alt={title} width={64} height={64} className="object-cover w-full h-full" />
            </div>
          )}
          <p className="text-sm font-semibold leading-snug line-clamp-3 text-foreground/90 group-hover:text-foreground transition-colors self-center">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Original post quote block (LinkedIn inner card) ──────────────────────────
function OriginalPostBlock({ post }: { post: CommunityPost }) {
  const href = post.slug ? `/community/${post.slug}` : `/community/${post.id}`;
  return (
    <Link href={href} className="group block">
      <div className="border border-border rounded-xl overflow-hidden bg-accent-subtle/20 hover:border-primary/30 hover:shadow-sm transition-all">
        {/* Original author */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border/40">
          {post.authorImage ? (
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
              <Image src={post.authorImage} alt={post.authorName} width={24} height={24} className="object-cover" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">{post.authorName[0]}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">{post.authorName}</span>
            <span className="text-xs text-muted-foreground shrink-0">· {timeAgo(post.createdAt)}</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground/30 ml-auto group-hover:text-primary transition-colors shrink-0" />
        </div>
        {/* Original content */}
        <div className="px-3 py-3">
          <PostContent content={post.content} clamp={true} />
        </div>
        {/* Original image */}
        {post.imageUrl && (
          <div className="relative w-full aspect-video bg-accent-subtle">
            <Image src={post.imageUrl} alt="Original post image" fill className="object-cover" sizes="400px" />
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Repost editor modal ──────────────────────────────────────────────────────
function RepostEditor({
  post, onDone, onCancel,
}: {
  post: CommunityPostWithRepost;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
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
      toast.success('Reposted!');
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Repeat2 className="w-4 h-4 text-green-500" />
            Repost with your thoughts
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add your thoughts about this post…"
            rows={3}
            maxLength={1000}
            autoFocus
            className="w-full px-3 py-2.5 border border-border rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          {/* Original post preview */}
          <OriginalPostBlock post={post} />
        </div>
        <div className="px-5 py-4 border-t border-border flex gap-3 justify-end bg-accent-subtle/10">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent-subtle transition-colors">
            Cancel
          </button>
          <button onClick={() => void submit()} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-primary text-white rounded-xl font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors">
            {saving ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Repeat2 className="w-3.5 h-3.5" />}
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
  const { isSignedIn }                  = useAuth();
  const [liked, setLiked]               = useState(false);
  const [likeCount, setLikeCount]       = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [showRepost, setShowRepost]     = useState(false);
  const [showMenu, setShowMenu]         = useState(false);
  const [repostCount, setRepostCount]   = useState(post.repostsCount);
  const [shareCount, setShareCount]     = useState(post.shareCount ?? 0);
  const [authPrompt, setAuthPrompt]     = useState('');
  const [copied, setCopied]             = useState(false);

  const postHref = post.slug ? `/community/${post.slug}` : `/community/${post.id}`;

  const fetchLikeState = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/${post.id}/like`);
      if (!res.ok) return;
      const d = await res.json() as { count?: number; liked?: boolean };
      if (typeof d.liked === 'boolean') setLiked(d.liked);
      if (typeof d.count === 'number')  setLikeCount(d.count);
    } catch { /* non-critical */ }
  }, [post.id]);

  useEffect(() => { void fetchLikeState(); }, [fetchLikeState]);

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
        if (typeof d.count === 'number')  setLikeCount(d.count);
        if (typeof d.liked === 'boolean') setLiked(d.liked);
      } else {
        setLiked(!willLike);
        setLikeCount(c => c + (willLike ? -1 : 1));
      }
    } catch {
      setLiked(!willLike);
      setLikeCount(c => c + (willLike ? -1 : 1));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/community/${post.id}`, { method: 'DELETE' });
      onDeleted?.(post.id);
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${postHref}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.authorName} on SR Arts`, text: post.content.slice(0, 100), url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Link copied!');
      }
      void fetch(`/api/community/${post.id}/share`, { method: 'POST' });
      setShareCount(c => c + 1);
    } catch { /* cancelled */ }
  };

  // Determine if this is a repost of a community post, or a repost of external content
  const isCommunityRepost = !!post.repostOfId && post.referenceType === 'post';
  const isExternalRepost  = !!post.referenceType && post.referenceType !== 'post' && !!post.referenceId;

  const isOwner = currentUserId === post.authorId;

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* ── Repost badge (like LinkedIn "Name reposted") ─────────────── */}
        {(isCommunityRepost || isExternalRepost) && (
          <div className="px-4 pt-3 pb-0 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Repeat2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span className="font-medium text-foreground/60">
              {post.authorName} reposted
              {isExternalRepost && post.referenceType && (
                <span className="text-muted-foreground"> · {post.referenceType === 'artwork' ? 'an artwork' : 'a blog post'}</span>
              )}
            </span>
          </div>
        )}

        {/* ── Header: reposter/author info ─────────────────────────────── */}
        <div className="flex items-start justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            {post.authorImage ? (
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
                <Image src={post.authorImage} alt={post.authorName} width={40} height={40} className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">{post.authorName[0].toUpperCase()}</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-sm leading-tight">{post.authorName}</p>
              <Link href={postHref} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {timeAgo(post.createdAt)}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link href={postHref} className="p-1.5 rounded-lg hover:bg-accent-subtle text-muted-foreground transition-colors" title="View full post">
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            {isOwner && (
              <div className="relative">
                <button onClick={() => setShowMenu(v => !v)}
                  className="p-1.5 rounded-lg hover:bg-accent-subtle text-muted-foreground transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
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
        </div>

        {/* ── Reposter's commentary (their added thoughts on the repost) ── */}
        {(isCommunityRepost || isExternalRepost) && post.content && (
          <div className="px-4 pb-3">
            <PostContent content={post.content} clamp={true} />
          </div>
        )}

        {/* ── For NON-repost original posts: show content + image ─────── */}
        {!isCommunityRepost && !isExternalRepost && (
          <>
            <Link href={postHref} className="block px-4 pb-3">
              <PostContent content={post.content} clamp={true} />
            </Link>
            {post.imageUrl && (
              <Link href={postHref} className="block">
                <div className="relative w-full aspect-video bg-accent-subtle">
                  <Image src={post.imageUrl} alt="Post image" fill
                    className="object-cover hover:brightness-95 transition-all"
                    sizes="(max-width: 640px) 100vw, 600px" />
                </div>
              </Link>
            )}
          </>
        )}

        {/* ── Inner quoted block (LinkedIn style) ───────────────────────── */}
        {/* Community post repost → show original post card */}
        {isCommunityRepost && post.repostOf && (
          <div className="mx-4 mb-3">
            <OriginalPostBlock post={post.repostOf} />
          </div>
        )}

        {/* External repost → show artwork / blog card */}
        {isExternalRepost && post.referenceId && (
          <div className="mx-4 mb-3">
            <ExternalReferenceCard
              type={post.referenceType as 'artwork' | 'blog'}
              title={post.referenceTitle ?? ''}
              image={post.referenceImage ?? null}
              slug={post.referenceSlug ?? post.referenceId}
            />
          </div>
        )}

        {/* ── Action bar ─────────────────────────────────────────────────── */}
        <div className="px-4 py-2.5 border-t border-border flex items-center gap-1">
          {/* Like */}
          <div className="relative">
            <button
              onClick={() => void toggleLike()}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                liked ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:bg-accent-subtle hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
              <span className="tabular-nums text-xs">{likeCount > 0 ? likeCount : ''}</span>
            </button>
            <AnimatePresence>
              {authPrompt === 'like' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
              showComments ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent-subtle hover:text-primary'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="tabular-nums text-xs">{post.commentsCount > 0 ? post.commentsCount : ''}</span>
          </button>

          {/* Repost */}
          <div className="relative">
            <button
              onClick={() => {
                if (!isSignedIn) { setAuthPrompt('repost'); setTimeout(() => setAuthPrompt(''), 3000); return; }
                setShowRepost(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent-subtle hover:text-green-600 transition-all"
            >
              <Repeat2 className="w-4 h-4" />
              <span className="tabular-nums text-xs">{repostCount > 0 ? repostCount : ''}</span>
            </button>
            <AnimatePresence>
              {authPrompt === 'repost' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
            onClick={() => void handleShare()}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ml-auto ${
              copied ? 'text-green-500 bg-green-50' : 'text-muted-foreground hover:bg-accent-subtle hover:text-blue-500'
            }`}
          >
            {copied ? <CheckCheck className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {shareCount > 0 && <span className="tabular-nums text-xs">{shareCount}</span>}
          </button>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="p-4">
                <CommentsSection targetId={post.id} targetType="community" title="Replies" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      {/* Repost editor modal */}
      <AnimatePresence>
        {showRepost && (
          <RepostEditor
            post={post}
            onDone={() => { setShowRepost(false); setRepostCount(c => c + 1); }}
            onCancel={() => setShowRepost(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
