'use client';
/**
 * components/community/universal-repost-client.tsx
 *
 * Handles reposts of artworks, blog posts, and community posts.
 * Commentary note now uses the UnifiedEditor in minimal mode.
 */
import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Send, Repeat2, ImageIcon, BookOpen, MessageSquare } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { UnifiedEditor } from '@/components/editor/unified-editor';

interface ReferenceData {
  type:    'artwork' | 'blog' | 'post';
  id:      string;
  title:   string;
  image:   string | null;
  slug:    string;
  excerpt: string | null;
  author?: string;
}

interface Props {
  reference: ReferenceData;
}

const TYPE_META = {
  artwork: {
    icon:  ImageIcon,
    label: 'Artwork',
    color: 'text-primary bg-primary/10',
    href:  (slug: string) => `/gallery/${slug}`,
  },
  blog: {
    icon:  BookOpen,
    label: 'Blog Post',
    color: 'text-blue-600 bg-blue-50',
    href:  (slug: string) => `/blog/${slug}`,
  },
  post: {
    icon:  MessageSquare,
    label: 'Community Post',
    color: 'text-green-600 bg-green-50',
    href:  (slug: string) => `/community/${slug}`,
  },
};

export function UniversalRepostClient({ reference }: Props) {
  const router   = useRouter();
  const { user } = useUser();
  const [noteHtml, setNoteHtml] = useState('');
  const [saving, setSaving]     = useState(false);

  const meta = TYPE_META[reference.type];
  const Icon = meta.icon;

  // Strip HTML tags to get plain text for char count
  const plainNote = noteHtml.replace(/<[^>]*>/g, '').trim();

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    try {
      let res: Response;

      if (reference.type === 'post') {
        res = await fetch(`/api/community/${reference.id}/repost`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ note: noteHtml }),
        });
      } else {
        res = await fetch('/api/community/repost', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note:           noteHtml,
            referenceType:  reference.type,
            referenceId:    reference.id,
            referenceTitle: reference.title,
            referenceImage: reference.image,
            referenceSlug:  reference.slug,
          }),
        });
      }

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Failed to repost');
      }

      const d = await res.json() as { post?: { slug?: string; id: string } };
      toast.success('Reposted to Community!');
      router.push(d.post?.slug ? `/community/${d.post.slug}` : '/community');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to repost');
    } finally {
      setSaving(false);
    }
  }, [noteHtml, reference, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Repeat2 className="w-5 h-5 text-green-500" />
          <h1 className="text-lg font-bold">Share to Community</h1>
        </div>
        <div className="w-20" />
      </div>

      {/* Main card */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Author */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          {user?.imageUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
              <Image src={user.imageUrl} alt={user.fullName ?? ''} width={40} height={40} className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">
                {(user?.fullName ?? 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{user?.fullName ?? user?.username ?? 'You'}</p>
            <p className="text-xs text-muted-foreground">Sharing to Community</p>
          </div>
        </div>

        {/* Commentary — rich editor in minimal mode */}
        <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
          <UnifiedEditor
            content=""
            onChange={setNoteHtml}
            mode="minimal"
            placeholder="Add your thoughts about this… (optional, supports rich text)"
            minHeight="120px"
            uploadFolder="sr_arts/community"
            showRibbon={true}
            showBubbleMenu={true}
            showCharCount={false}
            enableAI={false}
          />
        </div>

        {/* Char count */}
        {plainNote.length > 0 && (
          <div className="px-5 pb-2 text-right">
            <span className={`text-xs tabular-nums ${plainNote.length > 900 ? 'text-red-500' : 'text-muted-foreground/50'}`}>
              {plainNote.length}/1000
            </span>
          </div>
        )}

        {/* Original content preview */}
        <div className="mx-5 mb-5 border border-border rounded-xl overflow-hidden bg-accent-subtle/20">
          <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-border/50">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${meta.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {meta.label}
            </span>
            {reference.author && (
              <span className="text-xs text-muted-foreground">by {reference.author}</span>
            )}
          </div>

          <div className="flex gap-3 p-4">
            {reference.image && (
              <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-accent-subtle">
                <Image
                  src={reference.image}
                  alt={reference.title}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                {reference.title}
              </p>
              {reference.excerpt && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {reference.excerpt}
                </p>
              )}
              <Link
                href={meta.href(reference.slug)}
                target="_blank"
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View original ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border bg-accent-subtle/10">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-accent-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold
              rounded-xl hover:bg-primary-light disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
            {saving ? 'Sharing…' : 'Share to Community'}
          </button>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground pb-4">
        This will create a new post in the Community feed linking back to the original.
      </p>
    </motion.div>
  );
}
