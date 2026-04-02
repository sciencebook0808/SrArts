'use client';
/**
 * components/community/create-post-editor.tsx
 * Community post creation — powered by the unified editor.
 */
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X, Loader2, Send } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

import { UnifiedEditor } from '@/components/editor/unified-editor';
import { ImageUploadZone } from '@/components/ui/image-upload-zone';
import { LinkPreviewCard, useDetectedUrl } from '@/components/community/link-preview-card';

interface Props {
  defaultMode?: string;
}

export function CreatePostEditor({ defaultMode: _defaultMode }: Props) {
  const router = useRouter();
  const { user } = useUser();

  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageId, setCoverImageId] = useState('');
  const [saving, setSaving] = useState(false);
  const [linkDismissed, setLinkDismissed] = useState('');

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    const div = document.createElement('div');
    div.innerHTML = html;
    setPlainText(div.textContent ?? '');
  }, []);

  const foundUrl = useDetectedUrl(plainText, 800);
  const activeUrl = foundUrl && foundUrl !== linkDismissed ? foundUrl : '';
  const charCount = plainText.length;

  const handlePublish = async () => {
    if (!plainText.trim()) { toast.error('Write something first!'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          imageUrl: coverImageUrl || null,
          imageId: coverImageId || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed');
      }
      const d = await res.json() as { post?: { slug?: string; id: string } };
      toast.success('Post published!');
      router.push(d.post?.slug ? `/community/${d.post.slug}` : '/community');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish');
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/community" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-lg font-bold">Create Post</h1>
        <div className="w-20" />
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Author header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          {user?.imageUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
              <Image src={user.imageUrl} alt={user.fullName ?? ''} width={40} height={40} className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">{(user?.fullName ?? 'U')[0].toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{user?.fullName ?? user?.username ?? 'You'}</p>
            <p className="text-xs text-muted-foreground">Posting to Community · Public</p>
          </div>
        </div>

        {/* Unified Editor — strips the outer card border to blend in */}
        <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
          <UnifiedEditor
            content={content}
            onChange={handleContentChange}
            mode="community"
            placeholder="What's on your mind? Share thoughts, art discoveries… (type / for commands)"
            minHeight="280px"
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
            <motion.div key="lp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-5 mb-4">
              <LinkPreviewCard url={activeUrl} onRemove={() => setLinkDismissed(activeUrl)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cover image preview */}
        <AnimatePresence>
          {coverImageUrl && (
            <motion.div key="cover" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-5 mb-4 relative aspect-video rounded-xl overflow-hidden bg-accent-subtle">
              <Image src={coverImageUrl} alt="Cover" fill className="object-cover" sizes="700px" />
              <button type="button" onClick={() => { setCoverImageUrl(''); setCoverImageId(''); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border bg-accent-subtle/10 space-y-3">
          {!coverImageUrl && (
            <ImageUploadZone
              folder="sr_arts/community"
              label="Add cover photo — drag & drop, click, or paste (Ctrl+V)"
              maxSizeMB={15}
              onChange={(url, id) => { setCoverImageUrl(url); setCoverImageId(id); }}
            />
          )}
          <div className="flex items-center justify-between gap-3">
            <span className={`text-xs tabular-nums ${charCount > 4500 ? 'text-red-500 font-semibold' : charCount > 3000 ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
              {charCount > 0 ? `${charCount} chars` : 'Start typing…'}
            </span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent-subtle transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => void handlePublish()} disabled={saving || charCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light disabled:opacity-50 transition-colors shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {saving ? 'Publishing…' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground pb-4">
        Drag images into editor · Paste YouTube links to embed · URLs auto-preview as cards
      </p>
    </motion.div>
  );
}
