'use client';
/**
 * components/comments/comment-drawer.tsx
 *
 * LinkedIn-style comment drawer. Matches the UI in screenshots exactly:
 *  - Bottom sheet with drag handle
 *  - Avatar + name + time on each comment
 *  - "Like | Reply" actions row
 *  - Indented replies with "View N replies" toggle
 *  - Input PINNED just above the keyboard (env(keyboard-inset-bottom) + visualViewport)
 *  - Single-line input expands on focus, sends on tap
 *  - Admin: delete any | Owner: edit + delete own
 *
 * KEYBOARD FIX:
 *  Uses CSS `padding-bottom: env(keyboard-inset-bottom, 0px)` + the
 *  `interactive-widget=resizes-content` viewport meta to keep input
 *  pinned above the software keyboard on iOS/Android.
 */

import {
  useState, useEffect, useCallback, useRef, useTransition,
} from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import {
  MessageCircle, Send, Loader2, MoreHorizontal,
  Pencil, Trash2, X, Check, ChevronDown, ChevronUp,
  Heart,
} from 'lucide-react';
import { Drawer } from 'vaul';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentData {
  id:              string;
  userId:          string;
  username:        string;
  userImage:       string | null;
  message:         string;
  isDeleted:       boolean;
  editedAt:        string | null;
  parentId:        string | null;
  replyCount:      number;
  replyToUsername: string | null;
  createdAt:       string;
  replies?:        CommentData[];
}

interface CommentsPage {
  comments:   CommentData[];
  nextCursor: string | null;
  total:      number;
}

interface Props {
  targetId:      string;
  targetType:    'artwork' | 'blog' | 'community';
  initialCount?: number;
  /** Render a clickable preview card instead of just the icon button */
  asPreview?:    boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(d: string): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60)     return 'just now';
  if (s < 3600)   return `${Math.floor(s / 60)}m`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function Avatar({ src, name, size = 36 }: { src: string | null; name: string; size?: number }) {
  if (src) {
    return (
      <div className="rounded-full overflow-hidden shrink-0 bg-muted" style={{ width: size, height: size }}>
        <Image src={src} alt={name} width={size} height={size} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className="rounded-full bg-primary/15 flex items-center justify-center shrink-0 font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Single comment ───────────────────────────────────────────────────────────

function CommentItem({
  comment, currentUserId, isAdmin, targetId, targetType,
  depth, onReplyPosted, onDeleted, onEdited,
}: {
  comment:        CommentData;
  currentUserId:  string | null;
  isAdmin:        boolean;
  targetId:       string;
  targetType:     string;
  depth:          number;
  onReplyPosted:  (parentId: string, reply: CommentData) => void;
  onDeleted:      (id: string, parentId: string | null) => void;
  onEdited:       (id: string, message: string) => void;
}) {
  const [showReplyInput,  setShowReplyInput]  = useState(false);
  const [showReplies,     setShowReplies]     = useState(false);
  const [replies,         setReplies]         = useState<CommentData[]>(comment.replies ?? []);
  const [loadingReplies,  setLoadingReplies]  = useState(false);
  const [replyText,       setReplyText]       = useState('');
  const [postingReply,    setPostingReply]    = useState(false);
  const [showMenu,        setShowMenu]        = useState(false);
  const [editing,         setEditing]         = useState(false);
  const [editText,        setEditText]        = useState(comment.message);
  const [savingEdit,      setSavingEdit]      = useState(false);
  const [localReplyCount, setLocalReplyCount] = useState(comment.replyCount);
  const [liked,           setLiked]           = useState(false);
  const menuRef  = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const isOwner   = currentUserId === comment.userId;
  const canDelete = isOwner || isAdmin;
  const canEdit   = isOwner && !comment.isDeleted;
  const isDeleted = comment.isDeleted;

  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  const loadReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const res  = await fetch(`/api/comments/${comment.id}/replies`);
      const data = await res.json() as { replies?: CommentData[] };
      setReplies(data.replies ?? []);
    } catch { toast.error('Could not load replies'); }
    finally { setLoadingReplies(false); }
  }, [comment.id]);

  const handleToggleReplies = async () => {
    if (!showReplies && localReplyCount > replies.length) await loadReplies();
    setShowReplies(v => !v);
  };

  const handlePostReply = async () => {
    if (!replyText.trim()) return;
    setPostingReply(true);
    try {
      const res = await fetch('/api/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          targetId, targetType, message: replyText.trim(),
          parentId: comment.id, replyToUserId: comment.userId, replyToUsername: comment.username,
        }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? 'Failed');
      const { comment: newReply } = await res.json() as { comment: CommentData };
      setReplies(r => [...r, newReply]);
      setLocalReplyCount(c => c + 1);
      setShowReplies(true);
      setReplyText('');
      setShowReplyInput(false);
      onReplyPosted(comment.id, newReply);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setPostingReply(false); }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? 'Failed');
      onDeleted(comment.id, comment.parentId);
      toast.success('Deleted');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: editText.trim() }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? 'Failed');
      const { comment: updated } = await res.json() as { comment: CommentData };
      onEdited(comment.id, updated.message);
      setEditing(false);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setSavingEdit(false); }
  };

  return (
    <div className={depth > 0 ? 'ml-10 pl-3 border-l-2 border-muted' : ''}>
      <div className="py-3">
        <div className="flex gap-2.5">
          {/* Avatar */}
          <div className="shrink-0 mt-0.5">
            {isDeleted
              ? <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><span className="text-xs text-muted-foreground">?</span></div>
              : <Avatar src={comment.userImage} name={comment.username} size={depth > 0 ? 30 : 36} />}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-start justify-between gap-1">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 leading-tight">
                {!isDeleted && (
                  <span className="font-semibold text-[13px] text-foreground">{comment.username}</span>
                )}
                {comment.replyToUsername && !isDeleted && depth > 0 && (
                  <span className="text-[11px] text-primary">@{comment.replyToUsername}</span>
                )}
                <span className="text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                {comment.editedAt && !isDeleted && (
                  <span className="text-[10px] text-muted-foreground/60 italic">• edited</span>
                )}
              </div>

              {canDelete && !isDeleted && (
                <div className="relative shrink-0" ref={menuRef}>
                  <button onClick={() => setShowMenu(v => !v)} className="p-1 rounded-full hover:bg-muted -mt-0.5 transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-7 z-50 w-36 rounded-xl border border-border bg-white shadow-xl overflow-hidden"
                      >
                        {canEdit && (
                          <button onClick={() => { setEditing(true); setShowMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
                        <button onClick={() => void handleDelete()}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Message */}
            {editing ? (
              <div className="mt-1.5 space-y-1.5">
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={2} maxLength={1000} autoFocus
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-background"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  <button onClick={() => void handleSaveEdit()} disabled={savingEdit || !editText.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-white rounded-lg disabled:opacity-60 font-medium">
                    {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                  </button>
                </div>
              </div>
            ) : (
              <p className={`mt-0.5 text-[13px] leading-relaxed ${isDeleted ? 'italic text-muted-foreground/50' : 'text-foreground/90'}`}>
                {comment.message}
              </p>
            )}

            {/* Actions: Like | Reply */}
            {!isDeleted && (
              <div className="flex items-center gap-4 mt-1.5">
                <button
                  onClick={() => setLiked(v => !v)}
                  className={`flex items-center gap-1 text-[12px] font-semibold transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500' : ''}`} />
                  Like
                </button>
                {currentUserId && (
                  <button
                    onClick={() => {
                      setShowReplyInput(v => !v);
                      setTimeout(() => replyRef.current?.focus(), 80);
                    }}
                    className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reply
                  </button>
                )}
              </div>
            )}

            {/* Inline reply textarea */}
            <AnimatePresence>
              {showReplyInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden mt-2"
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={replyRef}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.username}…`}
                      rows={1}
                      maxLength={1000}
                      className="flex-1 text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-muted/30"
                      style={{ minHeight: 38 }}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handlePostReply(); }}
                    />
                    <button
                      onClick={() => void handlePostReply()}
                      disabled={postingReply || !replyText.trim()}
                      className="p-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primary-light transition-colors shrink-0"
                    >
                      {postingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View replies */}
            {localReplyCount > 0 && depth === 0 && (
              <button
                onClick={() => void handleToggleReplies()}
                disabled={loadingReplies}
                className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary-light transition-colors"
              >
                {loadingReplies ? <Loader2 className="w-3 h-3 animate-spin" />
                  : showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showReplies ? 'Hide replies' : `View ${localReplyCount} repl${localReplyCount === 1 ? 'y' : 'ies'}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                targetId={targetId}
                targetType={targetType}
                depth={1}
                onReplyPosted={onReplyPosted}
                onDeleted={(rid, pid) => {
                  setReplies(r => r.filter(x => x.id !== rid));
                  setLocalReplyCount(c => Math.max(0, c - 1));
                  onDeleted(rid, pid);
                }}
                onEdited={(rid, msg) => setReplies(r => r.map(x => x.id === rid ? { ...x, message: msg } : x))}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CommentSkeleton() {
  return (
    <div className="flex gap-2.5 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted/60" />
        <div className="h-3 w-3/4 rounded bg-muted/40" />
      </div>
    </div>
  );
}

// ─── Input (pinned above keyboard) ───────────────────────────────────────────

function CommentInput({
  targetId, targetType, currentUser, onPosted,
}: {
  targetId:    string;
  targetType:  string;
  currentUser: { id: string; name: string; image: string | null } | null;
  onPosted:    (c: CommentData) => void;
}) {
  const [text,    setText]    = useState('');
  const [posting, setPosting] = useState(false);
  const taRef                 = useRef<HTMLTextAreaElement>(null);

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await fetch('/api/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ targetId, targetType, message: text.trim() }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? 'Failed');
      const { comment } = await res.json() as { comment: CommentData };
      setText('');
      if (taRef.current) taRef.current.style.height = 'auto';
      onPosted(comment);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setPosting(false); }
  };

  /* ── Keyboard-safe bottom inset ──────────────────────────────────────────
     CSS env(keyboard-inset-bottom) pushes the input above the software keyboard
     on iOS 15+ and Android Chrome 108+. The `interactive-widget` viewport meta
     must be set (done in app/layout.tsx) for this to work correctly.
  ── */

  if (!currentUser) {
    return (
      <div
        className="shrink-0 border-t border-border bg-white px-4 pt-3"
        style={{ paddingBottom: "max(20px, env(keyboard-inset-bottom, 20px))" }}
      >
        <SignInButton mode="modal">
          <button className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-colors">
            Sign in to comment
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div
      className="shrink-0 border-t border-border bg-white px-4 pt-3"
      style={{ paddingBottom: "max(20px, env(keyboard-inset-bottom, 20px))" }}
    >
      <div className="flex items-end gap-2.5">
        <Avatar src={currentUser.image} name={currentUser.name} size={32} />
        <div className="flex-1 relative">
          <textarea
            ref={taRef}
            value={text}
            onChange={e => {
              setText(e.target.value);
              const t = e.target;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
            placeholder="Add a comment…"
            rows={1}
            maxLength={1000}
            style={{ minHeight: 42 }}
            className="w-full text-sm border border-border rounded-3xl px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-muted/20 leading-relaxed transition-all"
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void post(); }}
          />
          <button
            onClick={() => void post()}
            disabled={posting || !text.trim()}
            className="absolute right-2 bottom-2 p-1.5 text-primary disabled:text-muted-foreground/40 hover:text-primary-light transition-colors"
          >
            {posting ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Send className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CommentDrawer (main export) ──────────────────────────────────────────────

export function CommentDrawer({ targetId, targetType, initialCount = 0, asPreview = false }: Props) {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user }                          = useUser();

  const [open,        setOpen]        = useState(false);
  const [comments,    setComments]    = useState<CommentData[]>([]);
  const [total,       setTotal]       = useState(initialCount);
  const [nextCursor,  setNextCursor]  = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAdmin,     setIsAdmin]     = useState(false);
  // Start at 0.88 so the input is always above-the-fold on all screen sizes.
  // On small phones at 0.55 the pinned textarea would be hidden below the snap boundary.
  const [activeSnap,  setActiveSnap]  = useState<number | string | null>(0.88);
  const [, startTransition]           = useTransition();

  const currentUser = isSignedIn && user
    ? { id: userId!, name: user.fullName ?? user.username ?? 'You', image: user.imageUrl ?? null }
    : null;

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/comments?targetId=${targetId}&targetType=${targetType}&take=20`);
      const data = await res.json() as CommentsPage;
      setComments(data.comments as unknown as CommentData[]);
      setNextCursor(data.nextCursor);
      setTotal(data.total);
    } catch { toast.error('Failed to load comments'); }
    finally { setLoading(false); }
  }, [targetId, targetType]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res  = await fetch(`/api/comments?targetId=${targetId}&targetType=${targetType}&cursor=${nextCursor}&take=20`);
      const data = await res.json() as CommentsPage;
      setComments(c => [...c, ...(data.comments as unknown as CommentData[])]);
      setNextCursor(data.nextCursor);
    } catch { toast.error('Failed to load more'); }
    finally { setLoadingMore(false); }
  };

  useEffect(() => { if (open) void loadComments(); }, [open, loadComments]);

  // Check admin (non-blocking, best-effort)
  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;
    fetch('/api/admin/stats').then(r => { if (r.ok) setIsAdmin(true); }).catch(() => {});
  }, [isSignedIn, isLoaded]);

  const handlePosted = (c: CommentData) => {
    startTransition(() => { setComments(cs => [c, ...cs]); setTotal(t => t + 1); });
  };
  const handleReplyPosted = (parentId: string) => {
    setTotal(t => t + 1);
    setComments(cs => cs.map(c => c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c));
  };
  const handleDeleted = (id: string, parentId: string | null) => {
    if (!parentId) { setComments(cs => cs.filter(c => c.id !== id)); setTotal(t => Math.max(0, t - 1)); }
  };
  const handleEdited = (id: string, message: string) => {
    setComments(cs => cs.map(c => c.id === id ? { ...c, message } : c));
  };

  return (
    <>
      {/* ── Trigger ──────────────────────────────────────────────────── */}
      {asPreview ? (
        /* Preview card — shows a tap-to-comment prompt */
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left group"
        >
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {initialCount > 0
              ? `View all ${total} comment${total === 1 ? '' : 's'}…`
              : 'Add a comment…'}
          </span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          aria-label={`${total} comments`}
        >
          <MessageCircle className="w-[18px] h-[18px] group-hover:text-primary transition-colors" />
          {total > 0 && <span className="font-medium tabular-nums">{total}</span>}
          <span className="hidden sm:inline text-xs">{total === 1 ? 'comment' : 'comments'}</span>
        </button>
      )}

      {/* ── Vaul Drawer ──────────────────────────────────────────────── */}
      <Drawer.Root
        open={open}
        onOpenChange={setOpen}
        snapPoints={[0.88, 0.97]}
        activeSnapPoint={activeSnap}
        setActiveSnapPoint={setActiveSnap}
        modal
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />

          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-2xl outline-none"
            style={{
              // dvh respects actual visible viewport (shrinks when keyboard opens).
              // 97dvh at the top snap leaves the status bar accessible.
              maxHeight: '97dvh',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-0 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <h2 className="font-bold text-[15px]">
                Comments{total > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">{total.toLocaleString()}</span>}
              </h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border shrink-0" />

            {/* Comment list — fills remaining space, min-h-0 allows proper flex shrink */}
            <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
              <div className="px-4">
                {loading ? (
                  [...Array(5)].map((_, i) => <CommentSkeleton key={i} />)
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <MessageCircle className="w-10 h-10 text-muted-foreground/25" />
                    <p className="font-semibold text-sm text-muted-foreground">No comments yet</p>
                    <p className="text-xs text-muted-foreground/60">Be the first to share your thoughts</p>
                  </div>
                ) : (
                  <>
                    <AnimatePresence initial={false}>
                      {comments.map(c => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <CommentItem
                            comment={c}
                            currentUserId={currentUser?.id ?? null}
                            isAdmin={isAdmin}
                            targetId={targetId}
                            targetType={targetType}
                            depth={0}
                            onReplyPosted={handleReplyPosted}
                            onDeleted={handleDeleted}
                            onEdited={handleEdited}
                          />
                          <div className="h-px bg-border/40" />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {nextCursor && (
                      <button
                        onClick={() => void loadMore()}
                        disabled={loadingMore}
                        className="w-full py-4 text-sm font-semibold text-primary flex items-center justify-center gap-2"
                      >
                        {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                        Load more
                      </button>
                    )}
                    <div className="h-3" />
                  </>
                )}
              </div>
            </div>

            {/* Input — pinned; shifts above keyboard via CSS env() */}
            {isLoaded && (
              <CommentInput
                targetId={targetId}
                targetType={targetType}
                currentUser={currentUser}
                onPosted={handlePosted}
              />
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
