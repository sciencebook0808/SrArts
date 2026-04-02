'use client';
/**
 * components/community/post-detail.tsx
 *
 * Full individual community post view — /community/[slug]
 *
 * LinkedIn-style rendering:
 *  - Repost badge if applicable
 *  - Author header
 *  - Commentary (for reposts)
 *  - Quoted original block OR external reference card
 *  - Like / Repost / Share / Comments
 */

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, MessageCircle, Repeat2, Share2,
  ArrowLeft, CheckCheck, ExternalLink,
  ImageIcon, BookOpen, Clock,
} from 'lucide-react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { CommentsSection } from '@/components/comments-section';
import { ProseContent } from '@/components/prose-content';
import { toast } from 'sonner';
import type { CommunityPost, CommunityPostWithRepost } from '@/lib/db-server';

function timeAgo(d: string | Date): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60)     return 'just now';
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Content renderer — delegates to shared ProseContent ─────────────────────
function PostContent({ content }: { content: string }) {
  return <ProseContent html={content} size="base" />;
}

function ExternalReferenceCard({ type, title, image, slug }: {
  type: 'artwork' | 'blog';
  title: string;
  image: string | null;
  slug: string;
}) {
  const href  = type === 'artwork' ? `/gallery/${slug}` : `/blog/${slug}`;
  const Icon  = type === 'artwork' ? ImageIcon : BookOpen;
  const label = type === 'artwork' ? 'Artwork' : 'Blog Post';
  const color = type === 'artwork' ? 'text-primary bg-primary/10' : 'text-blue-600 bg-blue-50';
  return (
    <Link href={href} className="group block">
      <div className="border border-border rounded-xl overflow-hidden bg-white hover:border-primary/40 hover:shadow-sm transition-all">
        <div className="px-4 pt-3 pb-2.5 flex items-center gap-2 border-b border-border/40">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/30 ml-auto group-hover:text-primary transition-colors" />
        </div>
        <div className="flex gap-4 p-4">
          {image && (
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-accent-subtle">
              <Image src={image} alt={title} width={80} height={80} className="object-cover w-full h-full" />
            </div>
          )}
          <p className="font-semibold text-base leading-snug line-clamp-3 text-foreground/90 group-hover:text-foreground transition-colors self-center">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
}

function OriginalPostQuote({ post }: { post: CommunityPost }) {
  const href = post.slug ? `/community/${post.slug}` : `/community/${post.id}`;
  const isHtml = post.content.trimStart().startsWith('<');
  return (
    <Link href={href} className="group block">
      <div className="border border-border rounded-xl overflow-hidden bg-accent-subtle/20 hover:border-primary/30 hover:shadow-sm transition-all">
        <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-border/40">
          {post.authorImage ? (
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
              <Image src={post.authorImage} alt={post.authorName} width={28} height={28} className="object-cover" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">{post.authorName[0]}</span>
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">{post.authorName}</span>
            <span className="text-xs text-muted-foreground shrink-0">· {timeAgo(post.createdAt)}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/30 ml-auto group-hover:text-primary transition-colors shrink-0" />
        </div>
        <div className="px-4 py-3">
          {isHtml ? (
            <div className="prose prose-sm max-w-none prose-p:text-foreground/80 prose-p:leading-relaxed line-clamp-4"
              dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="text-sm text-foreground/80 line-clamp-4 leading-relaxed">{post.content}</p>
          )}
        </div>
        {post.imageUrl && (
          <div className="relative w-full aspect-video bg-accent-subtle">
            <Image src={post.imageUrl} alt="Original" fill className="object-cover" sizes="600px" />
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Repost modal ─────────────────────────────────────────────────────────────
function RepostModal({ post, onDone, onCancel }: {
  post: CommunityPostWithRepost;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/community/${post.id}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? 'Failed');
      toast.success('Reposted!');
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Repeat2 className="w-4 h-4 text-green-500" />Repost with your thoughts
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add your thoughts…" rows={3} maxLength={1000} autoFocus
            className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          <OriginalPostQuote post={post} />
        </div>
        <div className="px-5 py-4 border-t border-border flex gap-3 justify-end bg-accent-subtle/10">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent-subtle transition-colors">Cancel</button>
          <button onClick={() => void submit()} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-primary text-white rounded-xl font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors">
            <Repeat2 className="w-3.5 h-3.5" />{saving ? 'Reposting…' : 'Repost'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── CommunityPostDetail ───────────────────────────────────────────────────────
interface Props {
  post: CommunityPostWithRepost;
  backHref: string;
}

export function CommunityPostDetail({ post, backHref }: Props) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [liked, setLiked]             = useState(false);
  const [likeCount, setLikeCount]     = useState(post.likesCount);
  const [showRepost, setShowRepost]   = useState(false);
  const [repostCount, setRepostCount] = useState(post.repostsCount);
  const [shareCount, setShareCount]   = useState(post.shareCount ?? 0);
  const [copied, setCopied]           = useState(false);

  const isCommunityRepost = !!post.repostOfId && post.referenceType === 'post';
  const isExternalRepost  = !!post.referenceType && post.referenceType !== 'post' && !!post.referenceId;

  const fetchLike = useCallback(async () => {
    try {
      const r = await fetch(`/api/community/${post.id}/like`);
      const d = await r.json() as { liked?: boolean; count?: number };
      if (typeof d.liked === 'boolean') setLiked(d.liked);
      if (typeof d.count === 'number')  setLikeCount(d.count);
    } catch { /* non-critical */ }
  }, [post.id]);

  useEffect(() => { void fetchLike(); }, [fetchLike]);

  const toggleLike = async () => {
    if (!isSignedIn) return;
    const will = !liked;
    setLiked(will); setLikeCount(c => c + (will ? 1 : -1));
    try {
      const r = await fetch(`/api/community/${post.id}/like`, { method: 'POST' });
      if (r.ok) {
        const d = await r.json() as { liked?: boolean; count?: number };
        if (typeof d.liked === 'boolean') setLiked(d.liked);
        if (typeof d.count === 'number')  setLikeCount(d.count);
      } else { setLiked(!will); setLikeCount(c => c + (will ? -1 : 1)); }
    } catch { setLiked(!will); setLikeCount(c => c + (will ? -1 : 1)); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community/${post.slug ?? post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.authorName} on SR Arts`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
        toast.success('Link copied!');
      }
      void fetch(`/api/community/${post.id}/share`, { method: 'POST' });
      setShareCount(c => c + 1);
    } catch { /* cancelled */ }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Back */}
        <button onClick={() => router.push(backHref)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        {/* Post card */}
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">

          {/* Repost badge */}
          {(isCommunityRepost || isExternalRepost) && (
            <div className="px-5 pt-4 pb-0 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Repeat2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <span className="font-medium text-foreground/60">
                {post.authorName} reposted{isExternalRepost ? ` · ${post.referenceType === 'artwork' ? 'an artwork' : 'a blog post'}` : ''}
              </span>
            </div>
          )}

          {/* Author */}
          <div className="flex items-start gap-3 px-5 pt-4 pb-4">
            {post.authorImage ? (
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
                <Image src={post.authorImage} alt={post.authorName} width={48} height={48} className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-lg">{post.authorName[0]}</span>
              </div>
            )}
            <div>
              <p className="font-bold text-base leading-tight">{post.authorName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })} · {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Commentary (for reposts) or full content (for original posts) */}
          <div className="px-5 pb-4">
            {(isCommunityRepost || isExternalRepost) && post.content && (
              <div className="mb-4">
                <PostContent content={post.content} />
              </div>
            )}
            {!isCommunityRepost && !isExternalRepost && (
              <PostContent content={post.content} />
            )}
          </div>

          {/* Cover image (original posts only) */}
          {!isCommunityRepost && !isExternalRepost && post.imageUrl && (
            <div className="relative w-full aspect-video bg-accent-subtle">
              <Image src={post.imageUrl} alt="Post image" fill className="object-cover" sizes="700px" />
            </div>
          )}

          {/* Inner quoted blocks */}
          {isCommunityRepost && post.repostOf && (
            <div className="mx-5 mb-5">
              <OriginalPostQuote post={post.repostOf} />
            </div>
          )}
          {isExternalRepost && post.referenceId && (
            <div className="mx-5 mb-5">
              <ExternalReferenceCard
                type={post.referenceType as 'artwork' | 'blog'}
                title={post.referenceTitle ?? ''}
                image={post.referenceImage ?? null}
                slug={post.referenceSlug ?? post.referenceId}
              />
            </div>
          )}

          {/* Stats bar */}
          {(likeCount > 0 || repostCount > 0) && (
            <div className="px-5 pb-2 flex items-center gap-4 text-xs text-muted-foreground border-b border-border/50">
              {likeCount > 0 && <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>}
              {repostCount > 0 && <span className="flex items-center gap-1"><Repeat2 className="w-3.5 h-3.5 text-green-500" />{repostCount} reposts</span>}
            </div>
          )}

          {/* Action bar */}
          <div className="px-5 py-3 flex items-center gap-2 border-b border-border">
            {isSignedIn ? (
              <button onClick={() => void toggleLike()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  liked ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:bg-accent-subtle hover:text-red-500'
                }`}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                {liked ? 'Liked' : 'Like'}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent-subtle transition-all">
                  <Heart className="w-4 h-4" />Like
                </button>
              </SignInButton>
            )}

            <button
              onClick={() => { if (!isSignedIn) return; setShowRepost(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent-subtle hover:text-green-600 transition-all"
            >
              <Repeat2 className="w-4 h-4" />Repost
            </button>

            <button onClick={() => void handleShare()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ml-auto ${
                copied ? 'text-green-500 bg-green-50' : 'text-muted-foreground hover:bg-accent-subtle hover:text-blue-500'
              }`}>
              {copied ? <CheckCheck className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
              {shareCount > 0 && <span className="text-xs tabular-nums">({shareCount})</span>}
            </button>
          </div>

          {/* Full comments */}
          <div className="p-5">
            <CommentsSection targetId={post.id} targetType="community" title="Comments" initialCount={post.commentsCount} />
          </div>
        </div>
      </motion.div>

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
