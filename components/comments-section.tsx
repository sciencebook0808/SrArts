'use client';
/**
 * CommentsSection — polymorphic (artwork | blog | community).
 * Requires Clerk sign-in to post. Reading is public.
 */
import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import Image from 'next/image';

interface Comment {
  id: string; userId: string; username: string; userImage?: string | null;
  message: string; createdAt: string;
}
interface Props { targetId: string; targetType: 'artwork' | 'blog' | 'community'; title?: string; }

function timeAgo(d: string): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function CommentsSection({ targetId, targetType, title = 'Comments' }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [comments, setComments]     = useState<Comment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?targetId=${targetId}&targetType=${targetType}`);
      const d = await res.json() as { comments?: Comment[] };
      setComments(d.comments ?? []);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [targetId, targetType]);

  useEffect(() => { void load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { setError('Write something first.'); return; }
    setError(''); setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetType, message: message.trim() }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      setMessage(''); setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      void load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="mt-12 pt-10 border-t border-border">
      <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        {title}
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h2>

      {/* ── Comment form ────────────────────────────────────────────────── */}
      <div className="bg-accent-subtle/40 rounded-2xl p-5 mb-8 border border-border space-y-3">
        <h3 className="font-semibold text-sm text-foreground/80">Leave a comment</h3>

        {!isLoaded ? (
          <div className="h-10 bg-border/30 rounded-xl animate-pulse" />
        ) : !isSignedIn ? (
          <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-border">
            <span className="text-sm text-muted-foreground">Sign in to join the conversation</span>
            <SignInButton mode="modal">
              <button className="px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors">
                Sign in
              </button>
            </SignInButton>
          </div>
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-3">
            <div className="flex items-start gap-3">
              {user?.imageUrl && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5">
                  <Image src={user.imageUrl} alt={user.fullName ?? ''} width={32} height={32} className="object-cover" />
                </div>
              )}
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3} maxLength={1000}
                className="flex-1 px-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-500">{error}</motion.p>
                )}
                {success && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-green-600 font-medium">✓ Posted!</motion.p>
                )}
                {!error && !success && <span />}
              </AnimatePresence>
              <button
                type="submit" disabled={submitting || !message.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Comments list ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border border-border rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {c.userImage ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <Image src={c.userImage} alt={c.username} width={32} height={32} className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">{c.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="font-semibold text-sm">{c.username}</span>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pl-10">{c.message}</p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
