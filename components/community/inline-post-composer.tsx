'use client';
/**
 * components/community/inline-post-composer.tsx
 *
 * Persistent inline composer — lives permanently in the feed.
 * - Never navigates away on submit — resets in place and stays open
 * - Collapses to a slim prompt row when not focused
 * - Expands to the full unified editor on click / focus
 * - Has a "+" new post button that always triggers expand
 * - Cover photo, link preview, char count all inline
 * - Calls onPosted(newPost) so the parent feed can prepend without refresh
 */
import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Loader2, Send, ImageIcon, PenLine, ChevronDown,
} from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { toast } from 'sonner';

import { UnifiedEditor } from '@/components/editor/unified-editor';
import { ImageUploadZone } from '@/components/ui/image-upload-zone';
import { LinkPreviewCard, useDetectedUrl } from '@/components/community/link-preview-card';
import type { CommunityPostWithRepost } from '@/lib/db-server';

interface Props {
  onPosted: (post: CommunityPostWithRepost) => void;
}

export function InlinePostComposer({ onPosted }: Props) {
  const { isLoaded, isSignedIn, user } = useUser();

  const [isExpanded, setIsExpanded]     = useState(false);
  const [content, setContent]           = useState('');
  const [plainText, setPlainText]       = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageId, setCoverImageId]   = useState('');
  const [saving, setSaving]             = useState(false);
  const [linkDismissed, setLinkDismissed] = useState('');
  const editorKey = useRef(0); // incrementing resets the editor

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (div) { div.innerHTML = html; setPlainText(div.textContent ?? ''); }
  }, []);

  const foundUrl = useDetectedUrl(plainText, 800);
  const activeUrl = foundUrl && foundUrl !== linkDismissed ? foundUrl : '';
  const charCount = plainText.length;

  const reset = useCallback(() => {
    editorKey.current += 1;   // forces UnifiedEditor to remount with empty content
    setContent('');
    setPlainText('');
    setCoverImageUrl('');
    setCoverImageId('');
    setLinkDismissed('');
    // stay expanded so they can write another post immediately
  }, []);

  const handlePublish = useCallback(async () => {
    if (!plainText.trim()) { toast.error('Write something first!'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/community', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          imageUrl: coverImageUrl || null,
          imageId:  coverImageId  || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }

      const d = await res.json() as { post?: CommunityPostWithRepost };
      if (d.post) {
        toast.success('Post published! ✓');
        onPosted(d.post);
        reset();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setSaving(false);
    }
  }, [content, coverImageUrl, coverImageId, plainText, onPosted, reset]);

  // ── Unauthenticated state ──────────────────────────────────────────────────
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

  // ── Collapsed prompt row ───────────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          {/* Avatar */}
          {user?.imageUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
              <Image src={user.imageUrl} alt={user.fullName ?? ''} width={40} height={40} className="object-cover" />
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
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-xl border border-border bg-accent-subtle/40
              text-sm text-muted-foreground/70 hover:bg-accent-subtle hover:border-primary/30
              hover:text-muted-foreground transition-all cursor-text"
          >
            {`What's on your mind, ${user?.firstName ?? 'there'}?`}
          </button>

          {/* Plus button shortcut */}
          <button
            onClick={() => setIsExpanded(true)}
            title="Create new post"
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center
              hover:bg-primary-light transition-colors shadow-sm shrink-0"
          >
            <PenLine className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action row */}
        <div className="flex items-center gap-1 px-4 pb-3">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              text-muted-foreground hover:bg-accent-subtle hover:text-primary transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photo
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              text-muted-foreground hover:bg-accent-subtle hover:text-primary transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            Write post
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Expanded composer ──────────────────────────────────────────────────────
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-border rounded-2xl shadow-md overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
        {user?.imageUrl ? (
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
            <Image src={user.imageUrl} alt={user.fullName ?? ''} width={36} height={36} className="object-cover" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xs">
              {(user?.fullName ?? user?.username ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-none">{user?.fullName ?? user?.username ?? 'You'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Posting to Community · Public</p>
        </div>
        <button
          type="button"
          onClick={() => { setIsExpanded(false); reset(); }}
          className="p-2 rounded-xl hover:bg-accent-subtle text-muted-foreground hover:text-foreground transition-colors"
          title="Collapse"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Rich editor — borderless inside the card */}
      <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
        <UnifiedEditor
          key={editorKey.current}
          content=""
          onChange={handleContentChange}
          mode="community"
          placeholder="What's on your mind? (type / for commands, drag images to upload)"
          minHeight="160px"
          uploadFolder="sr_arts/community"
          showRibbon={true}
          showBubbleMenu={true}
          showCharCount={false}
          enableAI={true}
        />
      </div>

      {/* Link preview */}
      <AnimatePresence>
        {activeUrl && (
          <motion.div
            key="lp"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-5 mb-3"
          >
            <LinkPreviewCard url={activeUrl} onRemove={() => setLinkDismissed(activeUrl)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover image preview */}
      <AnimatePresence>
        {coverImageUrl && (
          <motion.div
            key="cover"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-5 mb-3 relative aspect-video rounded-xl overflow-hidden bg-accent-subtle"
          >
            <Image src={coverImageUrl} alt="Cover" fill className="object-cover" sizes="700px" />
            <button
              type="button"
              onClick={() => { setCoverImageUrl(''); setCoverImageId(''); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border bg-accent-subtle/10 space-y-3">
        {!coverImageUrl && (
          <ImageUploadZone
            folder="sr_arts/community"
            label="Add cover photo — drag & drop or click"
            maxSizeMB={15}
            onChange={(url, id) => { setCoverImageUrl(url); setCoverImageId(id); }}
          />
        )}
        <div className="flex items-center justify-between gap-3">
          <span className={`text-xs tabular-nums ${
            charCount > 4500 ? 'text-red-500 font-semibold'
            : charCount > 3000 ? 'text-amber-500'
            : 'text-muted-foreground/50'
          }`}>
            {charCount > 0 ? `${charCount.toLocaleString()} chars` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setIsExpanded(false); reset(); }}
              className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent-subtle transition-colors text-foreground/70"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={saving || charCount === 0}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold
                rounded-xl hover:bg-primary-light disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
