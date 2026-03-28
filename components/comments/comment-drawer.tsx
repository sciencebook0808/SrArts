'use client';
/**
 * components/comments/comment-drawer.tsx
 *
 * YouTube Shorts-style comment drawer.
 *
 * BEHAVIOUR:
 *   • Trigger button (MessageCircle icon + count) opens a bottom drawer
 *   • Default snap: 55% of viewport height (half-screen)
 *   • Pull-up snap: 92% (near full-screen)
 *   • Smooth spring animation via vaul (already in deps)
 *   • Comment input pinned to drawer bottom
 *   • Thread list scrollable in the middle
 *   • Reply input appears inline below the replied-to comment
 *
 * FEATURES:
 *   • Top-level posting + nested replies
 *   • @mention display on replies
 *   • "View N replies" lazy-load toggle (loads from /api/comments/[id]/replies)
 *   • Cursor-based pagination ("Load more" at bottom)
 *   • Own comment: Edit (inline) + Delete
 *   • Admin: Delete any comment
 *   • Optimistic updates on post/delete
 *   • Skeleton loading state
 */

import {
  useState, useEffect, useCallback, useRef, useTransition,
} from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import {
  MessageCircle, Send, Loader2, Reply, ChevronDown,
  ChevronUp, MoreHorizontal, Pencil, Trash2, X, Check,
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
  targetId:   string;
  targetType: 'artwork' | 'blog' | 'community';
  /** Initial comment count to display on the trigger button */
  initialCount?: number;
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

function Avatar({
  userImage, username, size = 32,
}: { userImage: string | null; username: string; size?: number }) {
  if (userImage) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0 bg-muted"
        style={{ width: size, height: size }}
      >
        <Image
          src={userImage}
          alt={username}
          width={size}
          height={size}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Single comment item ──────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  targetId,
  targetType,
  depth = 0,
  onReplyPosted,
  onCommentDeleted,
  onCommentEdited,
}: {
  comment:          CommentData;
  currentUserId:    string | null;
  isAdmin:          boolean;
  targetId:         string;
  targetType:       string;
  depth?:           number;
  onReplyPosted:    (parentId: string, reply: CommentData) => void;
  onCommentDeleted: (id: string, parentId: string | null) => void;
  onCommentEdited:  (id: string, message: string) => void;
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
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner   = currentUserId === comment.userId;
  const canDelete = isOwner || isAdmin;
  const canEdit   = isOwner && !comment.isDeleted;

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const loadReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const res  = await fetch(`/api/comments/${comment.id}/replies`);
      const data = await res.json() as { replies?: CommentData[] };
      setReplies(data.replies ?? []);
    } catch {
      toast.error('Could not load replies');
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.id]);

  const handleToggleReplies = async () => {
    if (!showReplies && localReplyCount > (replies.length > 0 ? replies.length : 0)) {
      await loadReplies();
    }
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
          targetId,
          targetType,
          message:         replyText.trim(),
          parentId:        comment.id,
          replyToUserId:   comment.userId,
          replyToUsername: comment.username,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      const { comment: newReply } = await res.json() as { comment: CommentData };
      setReplies(r => [...r, newReply]);
      setLocalReplyCount(c => c + 1);
      setShowReplies(true);
      setReplyText('');
      setShowReplyInput(false);
      onReplyPosted(comment.id, newReply);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setPostingReply(false);
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      onCommentDeleted(comment.id, comment.parentId);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
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
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      const { comment: updated } = await res.json() as { comment: CommentData };
      onCommentEdited(comment.id, updated.message);
      setEditing(false);
      toast.success('Comment updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to edit');
    } finally {
      setSavingEdit(false);
    }
  };

  const isDeleted = comment.isDeleted;
  const indentPx  = depth > 0 ? 0 : 0; // visual indent handled by border

  return (
    <div className={depth > 0 ? 'pl-10 border-l-2 border-border/50 ml-4' : ''}>
      <div
        className={`group relative py-3 ${depth === 0 ? 'border-b border-border/30 last:border-b-0' : ''}`}
        style={{ paddingLeft: indentPx }}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          {!isDeleted ? (
            <Avatar userImage={comment.userImage} username={comment.username} size={depth > 0 ? 28 : 32} />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted shrink-0 flex items-center justify-center">
              <span className="text-muted-foreground text-xs">?</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                {!isDeleted && (
                  <span className="font-semibold text-sm text-foreground leading-tight">
                    {comment.username}
                  </span>
                )}
                {comment.replyToUsername && !isDeleted && (
                  <span className="text-xs text-primary font-medium">
                    @{comment.replyToUsername}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(comment.createdAt)}
                </span>
                {comment.editedAt && !isDeleted && (
                  <span className="text-[10px] text-muted-foreground/60 italic">(edited)</span>
                )}
              </div>

              {/* Action menu */}
              {canDelete && !isDeleted && (
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(v => !v)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-7 z-50 w-36 rounded-xl border border-border bg-white shadow-lg overflow-hidden"
                      >
                        {canEdit && (
                          <button
                            onClick={() => { setEditing(true); setShowMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => void handleDelete()}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Message or edit form */}
            {editing ? (
              <div className="mt-1.5 space-y-2">
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-background"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleSaveEdit()}
                    disabled={savingEdit || !editText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg disabled:opacity-60 hover:bg-primary-light transition-colors font-medium"
                  >
                    {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className={`mt-0.5 text-sm leading-relaxed ${isDeleted ? 'text-muted-foreground/50 italic' : 'text-foreground/90'}`}>
                {comment.message}
              </p>
            )}

            {/* Reply button */}
            {!isDeleted && currentUserId && (
              <button
                onClick={() => setShowReplyInput(v => !v)}
                className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}

            {/* Inline reply input */}
            <AnimatePresence>
              {showReplyInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to @${comment.username}…`}
                      rows={2}
                      maxLength={1000}
                      className="flex-1 text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-background"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handlePostReply();
                      }}
                    />
                    <button
                      onClick={() => void handlePostReply()}
                      disabled={postingReply || !replyText.trim()}
                      className="self-end p-2.5 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primary-light transition-colors shrink-0"
                    >
                      {postingReply
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View replies toggle */}
            {localReplyCount > 0 && depth === 0 && (
              <button
                onClick={() => void handleToggleReplies()}
                disabled={loadingReplies}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors"
              >
                {loadingReplies ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : showReplies ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
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
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-1 mb-2 space-y-1">
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
                  onCommentDeleted={(rid, pid) => {
                    setReplies(r => r.filter(x => x.id !== rid));
                    setLocalReplyCount(c => Math.max(0, c - 1));
                    onCommentDeleted(rid, pid);
                  }}
                  onCommentEdited={(rid, msg) => {
                    setReplies(r => r.map(x => x.id === rid ? { ...x, message: msg } : x));
                    onCommentEdited(rid, msg);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Comment input (pinned to bottom of drawer) ───────────────────────────────

function CommentInput({
  targetId,
  targetType,
  currentUser,
  onPosted,
}: {
  targetId:    string;
  targetType:  string;
  currentUser: { id: string; name: string; image: string | null } | null;
  onPosted:    (comment: CommentData) => void;
}) {
  const [text,      setText]      = useState('');
  const [posting,   setPosting]   = useState(false);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await fetch('/api/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ targetId, targetType, message: text.trim() }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      const { comment } = await res.json() as { comment: CommentData };
      setText('');
      onPosted(comment);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="px-4 py-3 border-t border-border bg-white/95 backdrop-blur-sm">
        <SignInButton mode="modal">
          <button className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors">
            Sign in to comment
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-border bg-white/95 backdrop-blur-sm">
      <div className="flex items-end gap-3">
        <Avatar userImage={currentUser.image} username={currentUser.name} size={32} />
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
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
            className="w-full text-sm border border-border rounded-2xl px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-muted/30 transition-all"
            style={{ minHeight: '44px' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handlePost();
            }}
          />
          <button
            onClick={() => void handlePost()}
            disabled={posting || !text.trim()}
            className="absolute right-2 bottom-2 p-1.5 text-primary disabled:text-muted-foreground/40 hover:text-primary-light transition-colors"
          >
            {posting
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-3 border-b border-border/30 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-10 rounded bg-muted/60" />
        </div>
        <div className="h-3 w-full rounded bg-muted/60" />
        <div className="h-3 w-3/4 rounded bg-muted/40" />
      </div>
    </div>
  );
}

// ─── Main CommentDrawer ───────────────────────────────────────────────────────

export function CommentDrawer({ targetId, targetType, initialCount = 0 }: Props) {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user }                          = useUser();

  const [open,        setOpen]        = useState(false);
  const [comments,    setComments]    = useState<CommentData[]>([]);
  const [total,       setTotal]       = useState(initialCount);
  const [nextCursor,  setNextCursor]  = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [,            startTransition] = useTransition();

  const currentUser = isSignedIn && user
    ? { id: userId!, name: user.fullName ?? user.username ?? 'You', image: user.imageUrl ?? null }
    : null;

  // Fetch initial comments when drawer opens
  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/comments?targetId=${targetId}&targetType=${targetType}&take=20`);
      const data = await res.json() as CommentsPage;
      setComments(data.comments as unknown as CommentData[]);
      setNextCursor(data.nextCursor);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res  = await fetch(
        `/api/comments?targetId=${targetId}&targetType=${targetType}&cursor=${nextCursor}&take=20`,
      );
      const data = await res.json() as CommentsPage;
      setComments(c => [...c, ...data.comments as unknown as CommentData[]]);
      setNextCursor(data.nextCursor);
    } catch {
      toast.error('Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (open) void loadComments();
  }, [open, loadComments]);

  // Check admin status (non-blocking)
  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;
    fetch('/api/admin/stats')
      .then(r => { if (r.ok) setIsAdmin(true); })
      .catch(() => {});
  }, [isSignedIn, isLoaded]);

  const handleCommentPosted = (comment: CommentData) => {
    startTransition(() => {
      setComments(c => [comment, ...c]);
      setTotal(t => t + 1);
    });
  };

  const handleReplyPosted = (parentId: string, _reply: CommentData) => {
    // replyCount is maintained in CommentItem; just update total
    setTotal(t => t + 1);
    // Ensure parent replyCount reflects the new reply in UI
    setComments(cs => cs.map(c =>
      c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c,
    ));
  };

  const handleCommentDeleted = (id: string, parentId: string | null) => {
    if (!parentId) {
      // Top-level: remove from list
      setComments(cs => cs.filter(c => c.id !== id));
      setTotal(t => Math.max(0, t - 1));
    }
    // Reply deletion is handled inside CommentItem
  };

  const handleCommentEdited = (id: string, message: string) => {
    setComments(cs => cs.map(c => c.id === id ? { ...c, message } : c));
  };

  // ── Snap points: 55% and 92% of viewport height ─────────────────────────
  const snapPoints: (string | number)[] = ['55%', '92%'];

  return (
    <>
      {/* ── Trigger button ──────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        aria-label={`${total} comments`}
      >
        <MessageCircle className="w-4.5 h-4.5 group-hover:text-primary transition-colors" />
        <span className="font-medium">{total > 0 ? total : ''}</span>
        <span className="hidden sm:inline text-xs">
          {total === 1 ? 'comment' : 'comments'}
        </span>
      </button>

      {/* ── Vaul Drawer ─────────────────────────────────────────────────── */}
      <Drawer.Root
        open={open}
        onOpenChange={setOpen}
        snapPoints={snapPoints}
        defaultSnapPoint="55%"
        modal
      >
        <Drawer.Portal>
          {/* Overlay */}
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" />

          {/* Panel */}
          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col
              bg-white rounded-t-3xl shadow-2xl
              outline-none
              max-h-[92dvh]"
            style={{ touchAction: 'none' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/25" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b border-border/50">
              <h2 className="font-bold text-base">
                Comments
                {total > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {total.toLocaleString()}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comment list — scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4">
              {loading ? (
                <div className="py-2">
                  {[...Array(5)].map((_, i) => <CommentSkeleton key={i} />)}
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium text-sm">No comments yet</p>
                  <p className="text-muted-foreground/60 text-xs">Be the first to share your thoughts</p>
                </div>
              ) : (
                <div className="py-2">
                  <AnimatePresence initial={false}>
                    {comments.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2, delay: loading ? i * 0.03 : 0 }}
                      >
                        <CommentItem
                          comment={c}
                          currentUserId={currentUser?.id ?? null}
                          isAdmin={isAdmin}
                          targetId={targetId}
                          targetType={targetType}
                          depth={0}
                          onReplyPosted={handleReplyPosted}
                          onCommentDeleted={handleCommentDeleted}
                          onCommentEdited={handleCommentEdited}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Load more */}
                  {nextCursor && (
                    <div className="py-4 flex justify-center">
                      <button
                        onClick={() => void loadMore()}
                        disabled={loadingMore}
                        className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary-light transition-colors"
                      >
                        {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Load more comments
                      </button>
                    </div>
                  )}

                  <div className="h-4" /> {/* bottom padding */}
                </div>
              )}
            </div>

            {/* Input — pinned to bottom */}
            {isLoaded && (
              <CommentInput
                targetId={targetId}
                targetType={targetType}
                currentUser={currentUser}
                onPosted={handleCommentPosted}
              />
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
